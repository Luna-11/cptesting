export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">


<div className="flex justify-center">
  {/* Main Content */}
  <main className="flex-1 flex items-center justify-center p-8">
    <div className="grid grid-cols-2 gap-8 items-center max-w-6xl">
      {/* Right Side: Text Content (now moved to the right) */}
      <div>
        <h1 className="text-4xl font-bold">
          Why Choose Study-With-Me?
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Our app was designed to help you get the most out of your study sessions, 
          with a focus on productivity, organization, and time management. 
  
        </p>
        <div className="mt-6">
          <button className="button2 ml-2 text-white px-4 py-2 rounded">
            Learnt More
          </button>
        </div>
      </div>

      {/* Left Side: Image (now moved to the left) */}
      <div className="flex flex-1">
        <img
          src="/mainpic.png"
          alt="Learning Illustration"
          className="w-full max-w-md"
        />
      </div>
    </div>
  </main>
</div>

      {/* First Section: Image on the Right, Text on the Left */}
      <div className="flex flex-1">
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="grid grid-cols-2 gap-8 items-center max-w-6xl">
            {/* Right Side: Image */}
            <div className="flex justify-center">
              <img
                src="/girl.png"
                alt="Learning Illustration"
                className="w-full max-w-md"
              />
            </div>

            {/* Left Side: Text Content */}
            <div>
              <h1 className="text-4xl font-bold">
                Stay displined with us!
              </h1>
              <p className="mt-4 text-lg text-gray-600">

                Whether you need a tool to help you stay on task or just a simple way to keep
                track of your progress, Study-With-Me is here to support your learning journey.
              </p>
              <div className="mt-6">
                <button className="button2 ml-2 text-white px-4 py-2 rounded">
                  Learnt More
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

     

      {/* Service Section (centered) */}
      <div className="mt-5">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">We Provide The Best plans for all the students</h2>
          <p className="mt-2">Let us unleash the full potential by using our plan</p>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 justify-center"> {/* Centered grid */}
          <div className="bg-white rounded-lg shadow-md p-4 mx-5">
            <div className="flex justify-center">
              <div className="bg-yellow-200 rounded-full p-2">
                <img src="/bear.png" alt="Seo/Sem" className="w-25 h-20" /> 
              </div>
            </div>
            <h3 className="text-lg font-semibold mt-2 text-center">Budget</h3>
            <p className="text-sm text-gray-600 mt-2 text-center">This plan is for especially for the students who are in budget with limited features.</p>
            <p className="button2 text-sm mt-2 text-center">Read More</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mx-5">
            <div className="flex justify-center">
              <div className="bg-green-200 rounded-full p-2">
                <img src="/cat.png" alt="Marketing" className="w-25 h-20" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mt-2 text-center">Better</h3>
            <p className="text-sm text-gray-600 mt-2 text-center">This plan is for the sudents who want to access for better features .</p>
            <p className="button2 text-sm mt-2 text-center">Read More</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mx-5">
            <div className="flex justify-center">
              <div className="bg-red-200 rounded-full p-2">
                <img src="/bearb.png" alt="Others" className="w-25 h-20" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mt-2 text-center">Best</h3>
            <p className="text-sm text-gray-600 mt-2 text-center">This plan is for the students who want to get access all the best features of us.</p>
            <p className="button2 text-sm mt-2 text-center">Read More</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-10">
        <p>© {new Date().getFullYear()} Study-With-Me. All rights reserved.</p>
      </footer>
    </div>
  );
}
