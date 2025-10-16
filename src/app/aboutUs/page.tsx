import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function AboutUsPage() {
  return (
    <>
      <Head>
        <title>How to Use Study-With-Me</title>
        <meta name="description" content="Interactive guide for Study-With-Me platform" />
      </Head>

      <div className="slides-container">

        <section className="slide bg-space-gradient-1">
          <div className="slide-content">
            <div className="planet-image"><img src="/cat11.png" alt="cat image" /> </div>
            <h1 className="slideOneh1">HOW TO USE</h1>
            <h2>STUDY-WITH-ME</h2>
            <p className="slide-description">This website is developed in order to help students to manage their time effectively and efficiently.</p>
            <p>Let's start to learn how to use this.</p>
          </div>
        </section>

        <section className="slide bg-space-dark-1">
          <div className="slide-content">
            <h1 className="slideOneh1">How to use Calendar Page</h1>
            
        <div className="content-grid">
                  <div className="text-content">
                    <p>The calendar page helps you manage and track your events efficiently.</p>
                    <ol className="steps-list">
                      <li>The hamster icon marks today's date on the calendar</li>
                      <li>Click on any date to add a new event</li>
                      <li>Enter your event title in the popup modal</li>
                      <li>Click on any existing event to delete it (with confirmation)</li>
                      <li>Responsive design works perfectly on all devices</li>
                      <li>Automatic synchronization with your account data</li>
                    </ol>
                  </div>
                  <div className="planet-image"><img src="/cat5.png" alt="Calendar interface showing events and dates" /> </div>
                </div>
              </div>
            </section>

        <section className="slide bg-space-dark-2">
          <div className="slide-content">
            <h1 className="slideOneh1">Study Session</h1>
            
        <div className="content-grid">
          <div className="planet-image"><img src="/cat4.png" alt="Study session interface with timer and notes" /> </div>
          <div className="text-content">
            <ul className="features-list">
              <li>Interactive study timer with start/stop functionality</li>
              <li>Smart break system with coffee (5 min) and meal (30 min) options</li>
              <li>Real-time session tracking and automatic saving</li>
              <li>Persistent timer that survives page refreshes</li>
              <li>Session history and progress monitoring</li>
              <li>Automatic study session recording with duration tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

        <section className="slide bg-space-dark-3">
        <div className="slide-content">
            <h1 className="slideOneh1">Timetable</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p>Organize your weekly schedule with customizable timetables:</p>
                <ol className="steps-list">
                  <li>Select your preferred time intervals (30, 60, or 120 minutes)</li>
                  <li>Choose your week range from Monday to Sunday</li>
                  <li>Click on any time slot to add or edit events</li>
                  <li>Color-code events for better organization</li>
                  <li>Drag to select multiple days for recurring events</li>
                  <li>Events automatically sync across your devices</li>
                  <li>Quickly remove events with one click</li>
                </ol>
              </div>
              <div className="planet-image">
                <img src="/cat3.png" alt="Weekly timetable interface showing color-coded events" />
              </div>
          </div>
        </div>
        </section>

        <section className="slide bg-space-dark-1">
          <div className="slide-content">
            <h1 className="slideOneh1">How to use Task Board</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p>The task board helps you organize and track your tasks through different stages of completion.</p>
                <ol className="steps-list">
                  <li>Add new tasks using the input field at the top</li>
                  <li>Mark tasks as important with the star icon for priority</li>
                  <li>Track progress through three stages: To Start → In Progress → Done</li>
                  <li>Use the dropdown to update task status as you work</li>
                  <li>Filter to show only important tasks when needed</li>
                  <li>Sort tasks by newest or oldest creation date</li>
                  <li>Delete completed or unnecessary tasks to keep your board clean</li>
                  <li>Visual progress bar shows exactly where each task stands</li>
                </ol>
              </div>
              <div className="planet-image">
                <img src="/cat6.png" alt="Task board interface showing progress tracking" />
              </div>
            </div>
          </div>
        </section>

        <section className="slide bg-space-dark-2">
          <div className="slide-content">
            <h1 className="slideOneh1">Study Analytics</h1>
            
            <div className="content-grid">
              <div className="planet-image">
                <img src="/cat1.png" alt="Study analytics dashboard with charts and graphs" />
              </div>
              <div className="text-content">
                <ul className="features-list">
                  <li>Weekly study hours tracking with bar charts</li>
                  <li>Break time analysis by type (coffee, meal, etc.)</li>
                  <li>Study vs break time comparison over time</li>
                  <li>Today's study sessions timeline with detailed notes</li>
                  <li>Visual progress tracking with interactive charts</li>
                  <li>Custom tooltips showing formatted time durations</li>
                  <li>Responsive charts that work on all devices</li>
                  <li>Real-time data updates from your study sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>


        <section className="slide bg-space-dark-3">
          <div className="slide-content">
            <h1 className="slideOneh1">User Profile</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p>Customize your study experience with your personal profile:</p>
                <ol className="steps-list">
                  <li>Upload profile picture and customize banner with highlighted text</li>
                  <li>Set your bio with favorite quotes, mottos, or lyrics</li>
                  <li>Track study streaks with visual calendar showing daily hours</li>
                  <li>Access and review all your study notes</li>
                  <li>Edit personal information and change password for security</li>
                  <li>View detailed study session history and study hour analytics</li>
                  <li>Customize about me section with professional introduction</li>
                  <li>Manage portfolio links and professional presentation</li>
                </ol>
              </div>
              <div className="planet-image">
                <img src="/catback.png" alt="User profile dashboard with customization options" />
              </div>
            </div>
          </div>
        </section>


        <section className="slide bg-space-gradient-1">
          <div className="slide-content">
            <h1 className="slideOneh1">Pro Focus Sessions</h1>
            
            <div className="content-grid">
              <div className="planet-image">
                <img src="/cat8.png" alt="Focus session interface with timer and background options" />
              </div>
              <div className="text-content">
                <p className="premium-badge">PREMIUM FEATURE</p>
                <ul className="features-list">
                  <li>Customizable Pomodoro timer with adjustable durations</li>
                  <li>Multiple background images to create your perfect study environment</li>
                  <li>Ambient sound options including Lofi, Rain, Cafe, and Ocean Waves</li>
                  <li>Volume control and mute functionality for audio preferences</li>
                  <li>Automatic time tracking and session saving to monitor progress</li>
                  <li>Responsive design that works seamlessly across all devices</li>
                  <li>One-click background switching to refresh your study space</li>
                  <li>Session pause and restart functionality for flexible studying</li>
                </ul>
              </div>
            </div>
          </div>
        </section>


        <section className="slide bg-space-dark-2">
          <div className="slide-content">
            <h1 className="slideOneh1">Vocabulary Study Pro</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p className="premium-badge">PREMIUM FEATURE</p>
                <ul className="features-list">                  
                  <li>Add words with definitions and track learning progress</li>
                  <li>Three-stage learning system: To Study → Studying → Done</li>
                  <li>Mark important words with star icons for priority review</li>
                  <li>Visual progress bars showing your learning journey</li>
                  <li>Cute hanging cat illustrations on each vocabulary card</li>
                  <li>Edit and delete functionality for easy content management</li>
                  <li>Responsive design that works on all devices</li>
                  <li>Real-time status updates and progress tracking</li>
                </ul>
              </div>
              <div className="planet-image">
                <img src="/cat8.png" alt="Vocabulary study interface with word cards and progress tracking" />
              </div>
            </div>
          </div>
        </section>

        <section className="slide bg-space-dark-2">
          <div className="slide-content">
            <h1 className="slideOneh1">Ready to Study?</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p className="premium-badge">PREMIUM FEATURE</p>
                <ul className="features-list">
                  <li>Complete study ecosystem with calendar scheduling and task management</li>
                  <li>Advanced focus sessions with customizable timers and ambient sounds</li>
                  <li>Vocabulary builder with progress tracking and visual learning aids</li>
                  <li>Comprehensive analytics and study reports for performance insights</li>
                  <li>Personalized profile with study streaks and note organization</li>
                  <li>Cross-platform synchronization across all your devices</li>
                  <li>Priority support and early access to new features</li>
                  <li>Ad-free experience with unlimited storage and advanced tools</li>
                </ul>
              </div>
              <div className="planet-image">
                <img src="/cat4.png" alt="Complete study platform with all features integrated" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}