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
        {/* Slide 1: Title Slide */}
        <section className="slide bg-space-gradient-1">

          <div className="slide-content">
            <h1>HOW TO USE</h1>
            <h2>STUDY-WITH-ME</h2>
            <p className="slide-description">Interactive guide to boost your productivity</p>
            <button className="cta-button">GET STARTED</button>
          </div>
        </section>

        {/* Slide 2: Getting Started */}
        <section className="slide bg-space-dark-1">
          <div className="slide-content">
            <div className="planet-tag">PLANET</div>
            <h1>GETTING STARTED</h1>
            
            <div className="content-grid">
              <div className="text-content">
                <p>Begin your productive study journey in just a few steps:</p>
                <ol className="steps-list">
                  <li>Create your free account</li>
                  <li>Set up your study profile</li>
                  <li>Choose your study room</li>
                  <li>Start your focused session</li>
                </ol>
                <button className="cta-button">LAUNCH NOW</button>
              </div>
              <div className="planet-image" style={{ backgroundImage: 'url(/earth.png)' }}></div>
            </div>
          </div>
        </section>

        {/* Slide 3: Key Features */}
        <section className="slide bg-space-dark-2">
          <div className="slide-content">
            <div className="planet-tag">PLANET</div>
            <h1>KEY FEATURES</h1>
            
            <div className="content-grid">
              <div className="planet-image" style={{ backgroundImage: 'url(/mars.png)' }}></div>
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

        {/* Slide 4: Study Rooms */}
        <section className="slide bg-space-dark-3">
          <div className="slide-content">
            <div className="planet-tag">PLANET</div>
            <h1>STUDY ROOMS</h1>
            
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
              <div className="planet-image" style={{ backgroundImage: 'url(/saturn.png)' }}></div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}