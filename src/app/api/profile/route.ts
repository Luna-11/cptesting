// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@script/db';

const DEFAULT_PROFILE = {
  bio: "Design is not just what it looks like, design is how it works.",
  profileImage: "/p6.png",
  bannerImage: "/bg.jpg",
  intro: "Hi, I'm a passionate graphic designer and illustrator.",
  description: "With over 5 years of experience in the design industry, I specialize in creating visually stunning illustrations and brand identities that tell compelling stories.",
  bannerText: "The Sky tells me there are *No limits* and curiosity tells me to *Explore*",
  occupation: "Graphic Designer & Illustrator"
};

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    const connection = await db.getConnection();
    
    // Fetch user data - get username from user table
    const [userRows] = await connection.execute(
      `SELECT name FROM user WHERE user_id = ?`,
      [userId]
    );

    // Fetch profile data from user_profiles table
    const [profileRows] = await connection.execute(
      `SELECT * FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    connection.release(); // ✅ release back to pool

    const users = userRows as any[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    const profile = (profileRows as any[])[0] || {};
    
    return NextResponse.json({
      user: {
        username: user.name
      },  
      profile: {
        profileImage: profile.profile_image || DEFAULT_PROFILE.profileImage,
        bannerImage: profile.banner_image || DEFAULT_PROFILE.bannerImage,
        bio: profile.bio || DEFAULT_PROFILE.bio,
        intro: profile.intro || DEFAULT_PROFILE.intro,
        description: profile.description || DEFAULT_PROFILE.description,
        bannerText: profile.banner_text || DEFAULT_PROFILE.bannerText,
        occupation: profile.occupation || DEFAULT_PROFILE.occupation
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const connection = await db.getConnection();

    // Update username in user table if provided and different
    if (data.username) {
      const [userRows] = await connection.execute(
        `SELECT name FROM user WHERE user_id = ?`,
        [userId]
      );
      const users = userRows as any[];
      const currentUsername = users[0]?.name;
      
      if (currentUsername !== data.username) {
        await connection.execute(
          `UPDATE user SET name = ? WHERE user_id = ?`,
          [data.username, userId]
        );
      }
    }

    // Check if profile exists
    const [profileRows] = await connection.execute(
      `SELECT * FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    const profiles = profileRows as any[];
    
    if (profiles.length > 0) {
      // Update only the fields that were provided in the request
      const existingProfile = profiles[0];
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (data.profileImage !== undefined && data.profileImage !== existingProfile.profile_image) {
        updateFields.push('profile_image = ?');
        updateValues.push(data.profileImage);
      }
      if (data.bannerImage !== undefined && data.bannerImage !== existingProfile.banner_image) {
        updateFields.push('banner_image = ?');
        updateValues.push(data.bannerImage);
      }
      if (data.bio !== undefined && data.bio !== existingProfile.bio) {
        updateFields.push('bio = ?');
        updateValues.push(data.bio);
      }
      if (data.intro !== undefined && data.intro !== existingProfile.intro) {
        updateFields.push('intro = ?');
        updateValues.push(data.intro);
      }
      if (data.description !== undefined && data.description !== existingProfile.description) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      if (data.bannerText !== undefined && data.bannerText !== existingProfile.banner_text) {
        updateFields.push('banner_text = ?');
        updateValues.push(data.bannerText);
      }
      if (data.occupation !== undefined && data.occupation !== existingProfile.occupation) {
        updateFields.push('occupation = ?');
        updateValues.push(data.occupation);
      }
      
      if (updateFields.length > 0) {
        updateValues.push(userId);
        await connection.execute(
          `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
          updateValues
        );
      }
    } else {
      // Create new profile
      await connection.execute(
        `INSERT INTO user_profiles 
         (user_id, profile_image, banner_image, bio, intro, description, banner_text, occupation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.profileImage || DEFAULT_PROFILE.profileImage,
          data.bannerImage || DEFAULT_PROFILE.bannerImage,
          data.bio || DEFAULT_PROFILE.bio,
          data.intro || DEFAULT_PROFILE.intro,
          data.description || DEFAULT_PROFILE.description,
          data.bannerText || DEFAULT_PROFILE.bannerText,
          data.occupation || DEFAULT_PROFILE.occupation
        ]
      );
    }

    connection.release(); // ✅ release

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    const { currentPassword, newPassword } = await request.json();
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current and new password are required' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Verify current password
    const [userRows] = await connection.execute(
      `SELECT password FROM user WHERE user_id = ?`,
      [userId]
    );

    const users = userRows as any[];
    if (users.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    if (currentPassword !== user.password) {
      connection.release();
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    if (currentPassword !== newPassword) {
      await connection.execute(
        `UPDATE user SET password = ? WHERE user_id = ?`,
        [newPassword, userId]
      );
    }

    connection.release(); // ✅ release

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
