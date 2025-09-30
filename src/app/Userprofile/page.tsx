"use client"
import { useState, useEffect, useCallback } from "react"
import type React from "react"

type NoteColor = "white" | "blue" | "yellow" | "green" | "pink"

interface StudyNote {
  id: number
  date: string
  subject: string
  notes: string
  color: NoteColor
}

// Default profile data
const DEFAULT_PROFILE = {
  username: "AlessiaTaulli",
  bio: "Design is not just what it looks like, design is how it works.",
  profileImage: "/p6.png",
  bannerImage: "/bg.jpg",
  intro: "Hi, I'm Alessia Taulli, a passionate graphic designer and illustrator based in Molfetta, Italy.",
  description:
    "With over 5 years of experience in the design industry, I specialize in creating visually stunning illustrations and brand identities that tell compelling stories.",
  bannerText: "The Sky tells me there are *No limits* and curiosity tells me to *Explore*",
  occupation: "Graphic Designer & Illustrator",
}

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export default function ProfilePage() {
  // State management
  const [activeTab, setActiveTab] = useState("about")
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false)
  const [isEditingBanner, setIsEditingBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Main state for persisted data
  const [formData, setFormData] = useState({
    username: DEFAULT_PROFILE.username,
    bio: DEFAULT_PROFILE.bio,
  })
  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE.profileImage)
  const [aboutMe, setAboutMe] = useState({
    intro: DEFAULT_PROFILE.intro,
    description: DEFAULT_PROFILE.description,
  })
  const [bannerData, setBannerData] = useState({
    image: DEFAULT_PROFILE.bannerImage,
    text: DEFAULT_PROFILE.bannerText,
  })

  // Dynamic study notes data
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([])
  const [studyStreaks, setStudyStreaks] = useState<{ date: string; hours: number }[]>([])
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null)

  // File validation function
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map(type => type.split('/')[1]).join(', ')}`
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
    
    return null
  }

  const generateStudyStreaks = (studySessions: any[]) => {
    const streaksMap: Record<string, number> = {};

    studySessions.forEach(session => {
      const date = session.created_at ? session.created_at.split('T')[0] : 
                  session.start_time ? session.start_time.split('T')[0] : 
                  new Date().toISOString().split('T')[0];
      
      let hours = 1; 
      
      if (session.start_time && session.end_time) {
        try {
          const start = new Date(session.start_time);
          const end = new Date(session.end_time);
          const durationMs = end.getTime() - start.getTime();
          hours = durationMs / (1000 * 60 * 60);
          hours = Math.max(0.5, Math.round(hours * 100) / 100);
        } catch (error) {
          console.error("Error calculating duration:", error);
          hours = 1;
        }
      }

      streaksMap[date] = (streaksMap[date] || 0) + hours;
    });

    return Object.entries(streaksMap).map(([date, hours]) => ({ 
      date, 
      hours: Math.round(hours)
    }));
  }

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        setFormData({
          username: data.user?.username || DEFAULT_PROFILE.username,
          bio: data.profile?.bio || DEFAULT_PROFILE.bio,
        })
        setProfileImage(data.profile?.profileImage || DEFAULT_PROFILE.profileImage)
        setAboutMe({
          intro: data.profile?.intro || DEFAULT_PROFILE.intro,
          description: data.profile?.description || DEFAULT_PROFILE.description,
        })
        setBannerData({
          image: data.profile?.bannerImage || DEFAULT_PROFILE.bannerImage,
          text: data.profile?.bannerText || DEFAULT_PROFILE.bannerText,
        })

        if (data.studyNotes && Array.isArray(data.studyNotes)) {
          const formattedNotes: StudyNote[] = data.studyNotes
            .filter((note: any) => note.notes && note.notes.trim() !== "")
            .map((note: any, index: number) => ({
              id: note.id || index,
              date: note.created_at || note.start_time || new Date().toISOString().split('T')[0],
              subject: note.subject || "Unknown Subject",
              notes: note.notes || "",
              color: ["white", "blue", "yellow", "green", "pink"][index % 5] as NoteColor
            }));
          
          setStudyNotes(formattedNotes);
          const streaks = generateStudyStreaks(data.studyNotes);
          setStudyStreaks(streaks);
        }
      } catch (error) {
        console.error("Fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    return { name, value }
  }, [])

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, setImage: (value: string) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Study Streak Calendar Component
  const StudyStreakCalendar = () => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    const daysArray: (number | null)[] = []
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i)
    }

    const getStudyHours = (day: number) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const dayData = studyStreaks.find((d) => {
        const streakDate = new Date(d.date).toISOString().split('T')[0];
        return streakDate === dateStr;
      });
      
      return dayData ? dayData.hours : 0;
    }

    const getColor = (hours: number) => {
      if (hours === 0) return "bg-gray-100"
      if (hours <= 1) return "bg-blue-100"
      if (hours <= 2) return "bg-blue-200"
      if (hours <= 3) return "bg-blue-300"
      if (hours <= 4) return "bg-blue-400"
      return "bg-blue-500"
    }

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-[#3d312e] text-sm md:text-base">
          {new Date().toLocaleString('default', { month: 'long' })} {currentYear} • {studyStreaks.filter((d) => d.hours > 0).length} study days
        </h4>
        
        <div className="grid grid-cols-7 gap-1 mb-1 text-xs text-center text-gray-500">
          <div className="text-[10px] md:text-xs">Sun</div>
          <div className="text-[10px] md:text-xs">Mon</div>
          <div className="text-[10px] md:text-xs">Tue</div>
          <div className="text-[10px] md:text-xs">Wed</div>
          <div className="text-[10px] md:text-xs">Thu</div>
          <div className="text-[10px] md:text-xs">Fri</div>
          <div className="text-[10px] md:text-xs">Sat</div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-6 md:h-8 rounded-sm bg-transparent"
                />
              )
            }
            
            const hours = getStudyHours(day)
            const isToday = day === currentDate.getDate() && currentMonth === new Date().getMonth()
            
            return (
              <div
                key={day}
                className={`h-6 md:h-8 rounded-sm ${getColor(hours)} flex items-center justify-center text-[10px] md:text-xs ${
                  isToday ? "ring-1 md:ring-2 ring-blue-500" : ""
                }`}
                title={`${day}/${currentMonth + 1}: ${hours} hour(s)`}
              >
                {isToday ? (
                  <span className="font-bold">{day}</span>
                ) : (
                  day
                )
                }
              </div>
            )
          })}
        </div>
        
        <div className="flex justify-between text-[10px] md:text-xs text-gray-500 mt-2">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-100 rounded-sm"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-300 rounded-sm"></div>
            <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    )
  }

  // Banner Component
  const Banner = () => {
    const splitTextIntoLines = (text: string) => {
      const words = text.split(/(\*.*?\*|\S+)/).filter((word) => word.trim() !== "")
      const middleIndex = Math.ceil(words.length / 2)
      const firstLine = words.slice(0, middleIndex).join(" ")
      const secondLine = words.slice(middleIndex).join(" ")
      return { firstLine, secondLine }
    }

    const renderHighlightedText = (line: string) => {
      const parts = line.split("*")
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span key={index} className="text-[#bba2a2]">
              {part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })
    }

    const { firstLine, secondLine } = splitTextIntoLines(bannerData.text)

    return (
      <div
        className="h-32 md:h-48 bg-cover bg-center flex items-center justify-center relative"
        style={{ backgroundImage: `url(${bannerData.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <button
          onClick={() => setIsEditingBanner(true)}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-white p-1 md:p-2 rounded-full shadow-md hover:bg-gray-100 transition"
          title="Edit banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5 text-[#3d312e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <h1 className="text-[#f0eeee] text-xl md:text-4xl font-bold text-center relative z-10 px-4">
          <div>{renderHighlightedText(firstLine)}</div>
          <div>{renderHighlightedText(secondLine)}</div>
        </h1>
      </div>
    )
  }

  // Banner Edit Modal
  const BannerEditModal = () => {
    const [editBannerData, setEditBannerData] = useState(bannerData)
    const [editBannerImage, setEditBannerImage] = useState<File | null>(null)
    const [previewBannerImage, setPreviewBannerImage] = useState(bannerData.image)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const MAX_LENGTH = 120

    const splitPreviewText = (text: string) => {
      const words = text.split(/(\*.*?\*|\S+)/).filter((word) => word.trim() !== "")
      const middleIndex = Math.ceil(words.length / 2)
      const firstLine = words.slice(0, middleIndex).join(" ")
      const secondLine = words.slice(middleIndex).join(" ")
      return { firstLine, secondLine }
    }

    const renderPreviewLine = (line: string) => {
      const parts = line.split("*")
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span key={index} className="text-[#bba2a2]">
              {part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })
    }

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target
      setEditBannerData((prev) => ({ ...prev, text: value }))
      setError(null)
    }, [])

    const handleBannerImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
        
        setEditBannerImage(file)
        setError(null)
        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
          setPreviewBannerImage(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }, [])

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        
        try {
          const formData = new FormData()
          formData.append('bannerText', editBannerData.text)
          
          if (editBannerImage) {
            formData.append('bannerImage', editBannerImage)
          }

          const response = await fetch("/api/profile", {
            method: "PUT",
            credentials: "include",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to update banner")
          }

          const result = await response.json()
          
          if (result.bannerImage) {
            setBannerData(prev => ({ ...prev, image: result.bannerImage }))
          }
          
          setBannerData(prev => ({ ...prev, text: editBannerData.text }))
          alert("Banner updated successfully!")
          setIsEditingBanner(false)
        } catch (error: any) {
          console.error("Error updating banner:", error)
          setError(error.message || "Failed to update banner")
        } finally {
          setIsSubmitting(false)
        }
      },
      [editBannerData, editBannerImage]
    )

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" key="banner-modal">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto mx-4">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg md:text-xl font-bold text-[#3d312e]">Edit Banner</h3>
            <button 
              onClick={() => setIsEditingBanner(false)} 
              className="text-[#3d312e] hover:text-[#2a221f]"
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Banner Image</label>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBannerImageChange} 
                      className="hidden" 
                      disabled={isSubmitting}
                    />
                    <div className="px-4 py-2 border border-[#bba2a2] rounded-md text-sm bg-white hover:bg-[#f0eeee] transition text-center disabled:opacity-50">
                      Change Image
                    </div>
                  </label>
                  {previewBannerImage && (
                    <img
                      src={previewBannerImage}
                      alt="Banner preview"
                      className="h-12 w-24 object-cover rounded-md mt-2 md:mt-0"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 5MB. Allowed types: JPEG, PNG, GIF, WebP
                </p>
              </div>

              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">
                  Banner Text (Highlight with *asterisks*)
                </label>
                <textarea
                  value={editBannerData.text}
                  onChange={handleTextChange}
                  maxLength={MAX_LENGTH}
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm h-32 bg-white disabled:opacity-50"
                  placeholder="Enter your banner text. Highlight words with *asterisks*"
                  disabled={isSubmitting}
                />
                <div className="text-right text-xs text-gray-500">
                  {editBannerData.text.length}/{MAX_LENGTH} characters
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <h4 className="font-medium mb-1">Preview:</h4>
                  <div className="text-center text-sm md:text-lg">
                    {(() => {
                      const { firstLine, secondLine } = splitPreviewText(editBannerData.text)
                      return (
                        <>
                          <div>{renderPreviewLine(firstLine)}</div>
                          <div>{renderPreviewLine(secondLine)}</div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsEditingBanner(false)}
                className="flex-1 px-4 py-2 text-sm border border-[#bba2a2] text-[#3d312e] rounded-md hover:bg-[#f0eeee] transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition disabled:opacity-50 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Password Edit Modal
  const PasswordEditModal = () => {
    const [editFormData, setEditFormData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = handleChange(e)
      setEditFormData((prev) => ({ ...prev, [name]: value }))
      setError(null)
    }, [handleChange])

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        if (editFormData.newPassword !== editFormData.confirmPassword) {
          setError("New passwords don't match!")
          setIsSubmitting(false)
          return
        }

        try {
          const response = await fetch("/api/profile", {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              currentPassword: editFormData.currentPassword,
              newPassword: editFormData.newPassword,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to update password")
          }

          alert("Password changed successfully!")
          setIsEditingPassword(false)
          setEditFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error: any) {
          console.error("Error updating password:", error)
          setError(error.message || "Failed to update password")
        } finally {
          setIsSubmitting(false)
        }
      },
      [editFormData]
    )

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" key="password-modal">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg md:text-xl font-bold text-[#3d312e]">Change Password</h3>
            <button 
              onClick={() => setIsEditingPassword(false)} 
              className="text-[#3d312e] hover:text-[#2a221f]"
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={editFormData.currentPassword}
                  onChange={handleLocalChange}
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm bg-white disabled:opacity-50"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={editFormData.newPassword}
                  onChange={handleLocalChange}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm bg-white disabled:opacity-50"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={editFormData.confirmPassword}
                  onChange={handleLocalChange}
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm bg-white disabled:opacity-50"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsEditingPassword(false)}
                className="flex-1 px-4 py-2 text-sm border border-[#bba2a2] text-[#3d312e] rounded-md hover:bg-[#f0eeee] transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition disabled:opacity-50 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // About Edit Modal
  const AboutEditModal = () => {
    const [editAboutMe, setEditAboutMe] = useState(aboutMe)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setEditAboutMe((prev) => ({ ...prev, [name]: value }))
      setError(null)
    }, [])

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        
        try {
          const formData = new FormData()
          formData.append('intro', editAboutMe.intro)
          formData.append('description', editAboutMe.description)

          const response = await fetch("/api/profile", {
            method: "PUT",
            credentials: "include",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to update profile")
          }

          setAboutMe(editAboutMe)
          alert("About section updated!")
          setIsEditingAbout(false)
        } catch (error: any) {
          console.error("Error updating profile:", error)
          setError(error.message || "Failed to update profile")
        } finally {
          setIsSubmitting(false)
        }
      },
      [editAboutMe]
    )

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" key="about-modal">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg md:text-xl font-bold text-[#3d312e]">Edit About Me</h3>
            <button 
              onClick={() => setIsEditingAbout(false)} 
              className="text-[#3d312e] hover:text-[#2a221f]"
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Introduction</label>
                <textarea
                  name="intro"
                  value={editAboutMe.intro}
                  onChange={handleLocalChange}
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm h-20 bg-white disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={editAboutMe.description}
                  onChange={handleLocalChange}
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm h-32 bg-white disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsEditingAbout(false)}
                className="flex-1 px-4 py-2 text-sm border border-[#bba2a2] text-[#3d312e] rounded-md hover:bg-[#f0eeee] transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition disabled:opacity-50 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Portfolio Edit Modal
  const PortfolioEditModal = () => {
    const [editFormData, setEditFormData] = useState(formData)
    const [editProfileImage, setEditProfileImage] = useState<File | null>(null)
    const [previewImage, setPreviewImage] = useState(profileImage)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setEditFormData((prev) => ({ ...prev, [name]: value }))
      setError(null)
    }, [])

    const handleLocalImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
        
        setEditProfileImage(file)
        setError(null)
        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
          setPreviewImage(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }, [])

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        
        try {
          const formData = new FormData()
          formData.append('username', editFormData.username)
          formData.append('bio', editFormData.bio)
          
          if (editProfileImage) {
            formData.append('profileImage', editProfileImage)
          }

          const response = await fetch("/api/profile", {
            method: "PUT",
            credentials: "include",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to update profile")
          }

          const result = await response.json()
          
          if (result.profileImage) {
            setProfileImage(result.profileImage)
          }

          setFormData(editFormData)
          alert("Profile details updated!")
          setIsEditingPortfolio(false)
        } catch (error: any) {
          console.error("Error updating profile:", error)
          setError(error.message || "Failed to update profile")
        } finally {
          setIsSubmitting(false)
        }
      },
      [editFormData, editProfileImage]
    )

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" key="portfolio-modal">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg md:text-xl font-bold text-[#3d312e]">Edit Profile Details</h3>
            <button 
              onClick={() => setIsEditingPortfolio(false)} 
              className="text-[#3d312e] hover:text-[#2a221f]"
              disabled={isSubmitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-white p-1 md:p-2 rounded-full shadow-md cursor-pointer border border-[#bba2a2] disabled:opacity-50">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLocalImageChange} 
                    className="hidden" 
                    disabled={isSubmitting}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5 text-[#3d312e]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Maximum file size: 5MB. Allowed types: JPEG, PNG, GIF, WebP
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleLocalChange}
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm bg-white disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Bio (Motto/Quote/Lyrics)</label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleLocalChange}
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm h-20 bg-white disabled:opacity-50"
                  placeholder="Enter your motto, favorite quote, or lyrics..."
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-[#3d312e] text-sm font-medium mb-1">Portfolio Link</label>
                <input
                  type="text"
                  value="https://www.behance.net/alessiataulli"
                  readOnly
                  className="w-full px-3 py-2 border border-[#bba2a2] rounded-md text-sm bg-[#f0eeee]"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsEditingPortfolio(false)}
                className="flex-1 px-4 py-2 text-sm border border-[#bba2a2] text-[#3d312e] rounded-md hover:bg-[#f0eeee] transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition disabled:opacity-50 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Study Note Modal
  const StudyNoteModal = () => {
    if (!selectedNote) return null

    const colorClasses = {
      white: "bg-white",
      blue: "bg-blue-100",
      yellow: "bg-yellow-100",
      green: "bg-green-100",
      pink: "bg-pink-100",
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" key="note-modal">
        <div className={`${colorClasses[selectedNote.color]} rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg md:text-xl font-bold text-[#3d312e]">{selectedNote.subject}</h3>
            <button onClick={() => setSelectedNote(null)} className="text-[#3d312e] hover:text-[#2a221f]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-4">
              <span className="text-sm text-gray-600">
                {new Date(selectedNote.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </span>
            </div>

            <div className="bg-white p-4 rounded-md mb-6">
              <pre className="whitespace-pre-wrap font-sans text-sm md:text-base">{selectedNote.notes}</pre>
            </div>

            <button
              onClick={() => setSelectedNote(null)}
              className="w-full px-4 py-2 bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f0eeee] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d312e]"></div>
        <p className="mt-4 text-[#3d312e]">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f0eeee]">
      {/* All Modals */}
      {isEditingBanner && <BannerEditModal />}
      {isEditingPassword && <PasswordEditModal />}
      {isEditingAbout && <AboutEditModal />}
      {isEditingPortfolio && <PortfolioEditModal />}
      {selectedNote && <StudyNoteModal />}

      {/* Banner */}
      <Banner />

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto w-full px-4 -mt-8 md:-mt-16 mb-8 gap-4 md:gap-8">
        {/* Left Profile Card */}
        <div className="w-full md:w-1/3 lg:w-1/4 z-10">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 sticky top-4">
            <div className="flex flex-col items-center relative">
              <img
                src={profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-md -mt-16 md:-mt-20 object-cover"
              />
            </div>

            <div className="mt-4 md:mt-6 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-[#3d312e]">{formData.username}</h2>
              <p className="text-sm md:text-base text-[#3d312e]">Graphic Designer & Illustrator</p>
              <p className="text-xs md:text-sm text-[#3d312e] mt-2 italic">"{formData.bio}"</p>
            </div>

            <div className="mt-4 md:mt-6 space-y-2 md:space-y-4">
              <button
                onClick={() => setIsEditingPassword(true)}
                className="w-full px-4 py-2 bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition text-sm md:text-base"
              >
                Change Password
              </button>
              <button
                onClick={() => setIsEditingPortfolio(true)}
                className="w-full px-4 py-2 border border-[#bba2a2] text-[#3d312e] rounded-md hover:bg-[#f0eeee] transition text-sm md:text-base"
              >
                Edit Profile Details
              </button>
              <button
                onClick={() => (window.location.href = "/purchases")}
                className="w-full px-4 py-2 border border-[#bba2a2] text-[#3d312e] rounded-md hover:bg-[#f0eeee] transition text-sm md:text-base"
              >
                Purchase Pro Plan
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-2/3 lg:w-3/4 pt-0 md:pt-16">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex border-b border-[#bba2a2] overflow-x-auto">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-3 font-medium capitalize whitespace-nowrap text-sm md:text-base ${
                  activeTab === "about"
                    ? "text-[#3d312e] border-b-2 border-[#3d312e]"
                    : "text-[#3d312e] hover:text-[#2a221f]"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("studyNotes")}
                className={`px-4 py-3 font-medium capitalize whitespace-nowrap text-sm md:text-base ${
                  activeTab === "studyNotes"
                    ? "text-[#3d312e] border-b-2 border-[#3d312e]"
                    : "text-[#3d312e] hover:text-[#2a221f]"
                }`}
              >
                Study Notes
              </button>
            </div>

            <div className="p-4 md:p-6 min-h-[300px]">
              {activeTab === "about" && (
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="w-full md:w-1/2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl md:text-2xl font-bold text-[#3d312e]">About Me</h3>
                      <button
                        onClick={() => setIsEditingAbout(true)}
                        className="px-3 py-1 text-sm bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-[#3d312e] mb-4 text-sm md:text-base">{aboutMe.intro}</p>
                    <p className="text-[#3d312e] text-sm md:text-base">{aboutMe.description}</p>
                  </div>

                  <div className="w-full md:w-1/2">
                    <h3 className="text-xl md:text-2xl font-bold text-[#3d312e] mb-4">Study Streak</h3>
                    <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
                      <StudyStreakCalendar />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "studyNotes" && (
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#3d312e] mb-4 md:mb-6">Study Notes</h3>
                  {studyNotes.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <p className="text-gray-500">No study notes available.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {studyNotes
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((note) => (
                          <div
                            key={note.id}
                            className="border border-[#bba2a2] rounded-lg p-3 md:p-4 hover:shadow-md transition"
                          >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-0">
                              <div>
                                <h4 className="font-bold text-[#3d312e] text-sm md:text-base">{note.subject}</h4>
                                <p className="text-xs md:text-sm text-gray-600">
                                  {new Date(note.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    weekday: "short",
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={() => setSelectedNote(note)}
                                className="px-3 py-1 text-xs md:text-sm bg-[#3d312e] text-[#f0eeee] rounded-md hover:bg-[#2a221f] transition self-start md:self-auto"
                              >
                                View Notes
                              </button>
                            </div>
                            <p className="mt-2 text-[#3d312e] line-clamp-2 text-sm md:text-base">{note.notes.split("\n")[0]}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}