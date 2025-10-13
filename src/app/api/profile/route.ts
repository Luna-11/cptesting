// app/api/profile/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@script/db"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export const dynamic = "force-dynamic"

const DEFAULT_PROFILE = {
  bio: "Design is not just what it looks like, design is how it works.",
  profileImage: "/p6.png",
  bannerImage: "/bg.jpg",
  intro: "Hi, I'm a passionate graphic designer and illustrator.",
  description:
    "With over 5 years of experience in the design industry, I specialize in creating visually stunning illustrations and brand identities that tell compelling stories.",
  bannerText: "The Sky tells me there are *No limits* and curiosity tells me to *Explore*",
}

// Helper function to validate database connection
const getDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Database connection unavailable');
  }
};

// Convert File to Base64
const fileToBase64 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  
  // Determine MIME type from file type
  let mimeType = 'image/jpeg';
  if (file.type) {
    mimeType = file.type;
  } else if (file.name) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    mimeType = mimeTypes[extension || ''] || 'image/jpeg';
  }
  
  return `data:${mimeType};base64,${base64}`;
};

// Helper function to save image to filesystem
const saveImageToFileSystem = async (
  base64Data: string, 
  userId: number, 
  type: 'profile' | 'banner'
): Promise<string> => {
  try {
    // Validate base64 format
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data format');
    }

    const mimeType = matches[1];
    const extension = mimeType.split('/')[1] || 'jpg';
    const base64String = matches[2];
    
    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP, SVG');
    }

    // Create buffer from base64
    const buffer = Buffer.from(base64String, 'base64');
    
    // Validate file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('Image too large. Maximum size is 5MB.');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles', userId.toString());
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${type}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return relative path for database storage
    return `/uploads/profiles/${userId}/${filename}`;

  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to validate base64 image
const validateBase64Image = (base64Data: string): boolean => {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return false;
    }

    // Validate it's actually base64
    const base64String = matches[2];
    try {
      Buffer.from(base64String, 'base64');
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
};

// Helper to process image input (handles both base64 string and File)
const processImageInput = async (imageInput: string | File): Promise<string> => {
  if (typeof imageInput === 'string') {
    // Check if it's already a filesystem path (starts with /uploads/)
    if (imageInput.startsWith('/uploads/')) {
      return imageInput; // Return as-is if it's already a filesystem path
    }
    
    // It's a base64 string
    if (!validateBase64Image(imageInput)) {
      throw new Error('Invalid base64 image format');
    }
    return imageInput;
  } else if (imageInput instanceof File) {
    // Convert File to base64
    return await fileToBase64(imageInput);
  } else {
    throw new Error('Invalid image format. Must be base64 string or File object');
  }
};

// Helper to delete old image files
const deleteOldImage = async (imagePath: string): Promise<void> => {
  try {
    if (imagePath && imagePath.startsWith('/uploads/') && !imagePath.startsWith('/uploads/profiles/default/')) {
      const fullPath = join(process.cwd(), 'public', imagePath);
      if (existsSync(fullPath)) {
        await unlink(fullPath);
        console.log(`Deleted old image: ${imagePath}`);
      }
    }
  } catch (error) {
    console.error('Error deleting old image:', error);
    // Don't throw error for cleanup failures
  }
};

export async function GET() {
  let connection;

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    connection = await getDatabaseConnection()

    const [userRows] = await connection.execute(
      `SELECT name FROM user WHERE user_id = ?`,
      [userId]
    )

    const [profileRows] = await connection.execute(
      `SELECT * FROM user_profiles WHERE user_id = ?`,
      [userId]
    )

    // Check if duration column exists in study_sessions table
    let notesQuery = `
      SELECT 
        ss.id,
        ss.subject_id,
        s.name AS subject,
        ss.notes,
        ss.start_time,
        ss.end_time,
        ss.created_at
      FROM study_sessions ss
      JOIN subjects s ON ss.subject_id = s.id
      WHERE ss.user_id = ?
      ORDER BY ss.created_at DESC
    `;

    // Try to include duration if the column exists
    try {
      // Test if duration column exists
      const [testColumns] = await connection.execute(
        `SHOW COLUMNS FROM study_sessions LIKE 'duration'`
      );
      
      if ((testColumns as any[]).length > 0) {
        notesQuery = `
          SELECT 
            ss.id,
            ss.subject_id,
            s.name AS subject,
            ss.notes,
            ss.duration,
            ss.start_time,
            ss.end_time,
            ss.created_at
          FROM study_sessions ss
          JOIN subjects s ON ss.subject_id = s.id
          WHERE ss.user_id = ?
          ORDER BY ss.created_at DESC
        `;
      }
    } catch (error) {
      console.log('Duration column not found, using fallback query');
    }

    const [notesRows] = await connection.execute(notesQuery, [userId])

    const users = userRows as any[]
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]
    const profile = (profileRows as any[])[0] || {}

    return NextResponse.json({
      user: {
        username: user.name,
      },
      profile: {
        profileImage: profile.profile_image || DEFAULT_PROFILE.profileImage,
        bannerImage: profile.banner_image || DEFAULT_PROFILE.bannerImage,
        bio: profile.bio || DEFAULT_PROFILE.bio,
        intro: profile.intro || DEFAULT_PROFILE.intro,
        description: profile.description || DEFAULT_PROFILE.description,
        bannerText: profile.banner_text || DEFAULT_PROFILE.bannerText,
      },
      studyNotes: notesRows,
    })
  } catch (error: any) {
    console.error("Database error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}

export async function PUT(request: Request) {
  let connection;
  
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Parse form data (supports both JSON and FormData)
    let data: any;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = {
        username: formData.get('username') as string,
        profileImage: formData.get('profileImage') as File | string,
        bannerImage: formData.get('bannerImage') as File | string,
        bio: formData.get('bio') as string,
        intro: formData.get('intro') as string,
        description: formData.get('description') as string,
        bannerText: formData.get('bannerText') as string,
      };
    } else {
      // Assume JSON
      data = await request.json();
    }

    connection = await getDatabaseConnection();
    await connection.beginTransaction();

    try {
      // Update username in user table if provided and different
      if (data.username) {
        const [userRows] = await connection.execute(`SELECT name FROM user WHERE user_id = ?`, [numericUserId])
        const users = userRows as any[]
        const currentUsername = users[0]?.name

        if (currentUsername !== data.username) {
          await connection.execute(`UPDATE user SET name = ? WHERE user_id = ?`, [data.username, numericUserId])
        }
      }

      // Check if profile exists
      const [profileRows] = await connection.execute(`SELECT * FROM user_profiles WHERE user_id = ?`, [numericUserId])
      const profiles = profileRows as any[]

      let profileImagePath: string | undefined;
      let bannerImagePath: string | undefined;

      // Process profile image if provided
      if (data.profileImage !== undefined && data.profileImage !== null) {
        const processedImage = await processImageInput(data.profileImage);
        
        // If it's a base64 string (not already a filesystem path), save to filesystem
        if (processedImage.startsWith('data:')) {
          profileImagePath = await saveImageToFileSystem(processedImage, numericUserId, 'profile');
        } else {
          profileImagePath = processedImage; // It's already a filesystem path
        }
      }

      // Process banner image if provided
      if (data.bannerImage !== undefined && data.bannerImage !== null) {
        const processedImage = await processImageInput(data.bannerImage);
        
        // If it's a base64 string (not already a filesystem path), save to filesystem
        if (processedImage.startsWith('data:')) {
          bannerImagePath = await saveImageToFileSystem(processedImage, numericUserId, 'banner');
        } else {
          bannerImagePath = processedImage; // It's already a filesystem path
        }
      }

      if (profiles.length > 0) {
        // Update existing profile
        const existingProfile = profiles[0]
        const updateFields: string[] = []
        const updateValues: any[] = []

        // Track old image paths for cleanup
        let oldProfileImage: string | null = null;
        let oldBannerImage: string | null = null;

        if (profileImagePath !== undefined) {
          oldProfileImage = existingProfile.profile_image;
          updateFields.push("profile_image = ?")
          updateValues.push(profileImagePath)
        }
        if (bannerImagePath !== undefined) {
          oldBannerImage = existingProfile.banner_image;
          updateFields.push("banner_image = ?")
          updateValues.push(bannerImagePath)
        }
        if (data.bio !== undefined && data.bio !== existingProfile.bio) {
          updateFields.push("bio = ?")
          updateValues.push(data.bio)
        }
        if (data.intro !== undefined && data.intro !== existingProfile.intro) {
          updateFields.push("intro = ?")
          updateValues.push(data.intro)
        }
        if (data.description !== undefined && data.description !== existingProfile.description) {
          updateFields.push("description = ?")
          updateValues.push(data.description)
        }
        if (data.bannerText !== undefined && data.bannerText !== existingProfile.banner_text) {
          updateFields.push("banner_text = ?")
          updateValues.push(data.bannerText)
        }

        if (updateFields.length > 0) {
          updateValues.push(numericUserId)
          await connection.execute(
            `UPDATE user_profiles SET ${updateFields.join(", ")} WHERE user_id = ?`, 
            updateValues
          )

          // Clean up old images after successful update
          if (oldProfileImage) {
            await deleteOldImage(oldProfileImage);
          }
          if (oldBannerImage) {
            await deleteOldImage(oldBannerImage);
          }
        }
      } else {
        // Create new profile
        await connection.execute(
          `INSERT INTO user_profiles 
           (user_id, profile_image, banner_image, bio, intro, description, banner_text)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            numericUserId,
            profileImagePath || DEFAULT_PROFILE.profileImage,
            bannerImagePath || DEFAULT_PROFILE.bannerImage,
            data.bio || DEFAULT_PROFILE.bio,
            data.intro || DEFAULT_PROFILE.intro,
            data.description || DEFAULT_PROFILE.description,
            data.bannerText || DEFAULT_PROFILE.bannerText,
          ],
        )
      }

      await connection.commit()

      return NextResponse.json({ 
        message: "Profile updated successfully",
        profileImage: profileImagePath,
        bannerImage: bannerImagePath
      })
    } catch (innerError: any) {
      await connection.rollback();
      console.error("Profile update inner error:", innerError);
      
      return NextResponse.json(
        {
          error: "Profile update failed",
          details: innerError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Profile update error:", error);
    
    return NextResponse.json(
      { 
        error: "Profile update failed",
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}

export async function PATCH(request: Request) {
  let connection;
  
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 })
    }

    connection = await getDatabaseConnection()

    // Verify current password
    const [userRows] = await connection.execute(`SELECT password FROM user WHERE user_id = ?`, [userId])

    const users = userRows as any[]
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]
    if (currentPassword !== user.password) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    if (currentPassword !== newPassword) {
      await connection.execute(`UPDATE user SET password = ? WHERE user_id = ?`, [newPassword, userId])
    }

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error: any) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}