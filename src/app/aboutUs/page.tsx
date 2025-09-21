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
                <p>The calendar page is mainly for the events arrangement. </p>
                <ol className="steps-list">
                  <li>The hamster on the calendar is to show the current date.</li>
                  <li>Click on the date you would like to set an event.</li>
                  <li>You can add the name of the event.</li>
                  <li>You can also choose what color you would like to see on your calendar.</li>
                  <li>You can always update the event by clicking on the event.</li>
                </ol>
                <button className="cta-button">Go to Calendar</button>
              </div>
              <div className="planet-image"><img src="/cat5.png" alt="test image" /> </div>
            </div>
          </div>
        </section>

        <section className="slide bg-space-dark-2">
          <div className="slide-content">
            <h1 className="slideOneh1">Study Session</h1>
            
            <div className="content-grid">
              <div className="planet-image"><img src="/cat4.png" alt="test image" /> </div>
              <div className="text-content">
                <ul className="features-list">
                  <li>Pomodoro Timer with customizable intervals</li>
                  <li>Study Room Creator for group sessions</li>
                  <li>Progress Tracking dashboard</li>
                  <li>Resource Sharing platform</li>
                  <li>Focus analytics and reports</li>
                </ul>
                <button className="cta-button">EXPLORE FEATURES</button>
              </div>
            </div>
          </div>
        </section>

        <section className="slide bg-space-dark-3">
          <div className="slide-content">
            <h1 className="slideOneh1">Timetable</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p>Join or create focused study environments:</p>
                <ol className="steps-list">
                  <li>Click "Create Room" or browse existing</li>
                  <li>Set study duration and goals</li>
                  <li>Invite study partners (optional)</li>
                  <li>Enable screen sharing if needed</li>
                  <li>Track session analytics afterward</li>
                </ol>
                <button className="cta-button">JOIN ROOM</button>
              </div>
             <div className="planet-image"><img src="/cat3.png" alt="test image" /> </div>
            </div>
          </div>
        </section>

        <section className="slide bg-space-dark-1">
          <div className="slide-content">
            <h1 className="slideOneh1">How to use To-Do-List</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p>The to-do list helps you organize your daily tasks efficiently. </p>
                <ol className="steps-list">
                  <li>Click on the input field to add a new task.</li>
                  <li>Press Enter or click the Add button to save your task.</li>
                  <li>Check the checkbox when you complete a task.</li>
                  <li>Use the edit button to modify existing tasks.</li>
                  <li>Delete tasks you no longer need with the trash icon.</li>
                </ol>
                <button className="cta-button">Go to To-Do List</button>
              </div>
              <div className="planet-image"><img src="/cat6.png" alt="test image" /> </div>
            </div>
          </div>
        </section>

        <section className="slide bg-space-dark-2">
          <div className="slide-content">
            <h1 className="slideOneh1">User Reports</h1>
            
            <div className="content-grid">
             <div className="planet-image"><img src="/cat1.png" alt="test image" /> </div>
              <div className="text-content">
                <ul className="features-list">
                  <li>Weekly study time analysis</li>
                  <li>Productivity trends and insights</li>
                  <li>Task completion statistics</li>
                  <li>Focus level measurements</li>
                  <li>Customizable report periods</li>
                </ul>
                <button className="cta-button">VIEW REPORTS</button>
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
                  <li>Upload a profile picture to personalize your account</li>
                  <li>Set your banner picutre and moti as your preferences</li>
                  <li>Track your study session streaks</li>
                  <li>Check the history of the notes and review them</li>
                  <li>Adjust settings & change password for security.</li>
                </ol>
                <button className="cta-button">EDIT PROFILE</button>
              </div>
              <div className="planet-image"><img src="/catback.png" alt="User profile illustration" /> </div>
            </div>
          </div>
        </section>


        <section className="slide bg-space-gradient-1">
          <div className="slide-content">
            <h1 className="slideOneh1">Pro Focus Sessions</h1>
            
            <div className="content-grid">
              <div className="planet-image"><img src="/cat8.png" alt="Focus session illustration" /> </div>
              <div className="text-content">
                <p className="premium-badge">PREMIUM FEATURE</p>
                <ul className="features-list">
                  <li>Avoid distraction during sessions</li>
                  <li>Different choises ambient sounds and focus music.</li>
                  <li>Options for images to make the better mood.</li>
                  <li>Pomodoro Timer to help you study efficiently.</li>
                </ul>
                <button className="cta-button premium-button">UPGRADE NOW</button>
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
                  <li>Add the words and the meaning of it.</li>
                  <li>Change the status to track your learning.</li>
                  <li>Memorize them with the cute cute cats word cards.</li>
                </ul>
                <button className="cta-button premium-button">TRY FREE TRIAL</button>
              </div>
              <div className="planet-image"><img src="/cat8.png" alt="Vocabulary study illustration" /> </div>
            </div>
          </div>
        </section>

        {/* Final Slide */}


<section className="slide bg-space-dark-2">
          <div className="slide-content">
            <h1 className="slideOneh1">Ready to Study?</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p className="premium-badge">PREMIUM FEATURE</p>
                <ul className="features-list">
                  <li> <p className="slide-description">You're now familiar with all the features of Study-With-Me.</p></li>
    
                </ul>
                <button className="cta-button premium-button">TRY FREE TRIAL</button>
              </div>
             <div className="planet-image"><img src="/cat4.png" alt="Happy studying illustration" /> </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}