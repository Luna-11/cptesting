import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <script type="module" src="/"></script>
      
      {/* Main Content Section */}
      <div className="flex justify-center px-8">
        <main className="flex-1 flex items-center justify-center p-8 max-w-[90%]">
          <div className="grid grid-cols-2 gap-8 items-center w-full">
            {/* Right Side: Text Content */}
            <div className="pl-4 flex flex-col justify-center h-full"> 
              <h1 className="text-4xl font-bold">Why Choose Study-With-Me?</h1>
              <p className="mt-4 text-lg text-gray-600">
                Our app was designed to help you get the most out of your study sessions, 
                with a focus on productivity, organization, and time management.
              </p>
              <div className="mt-6">
                <Link href="/aboutUs">
                  <button className="button2 text-white font-medium px-5 py-2 rounded-lg transition duration-200">
                    Read More
                  </button>
                </Link>
              </div>
            </div>

            {/* Left Side: Image */}
            <div className="flex flex-1 pr-4">
              <img
                src="/mainpic.png"
                alt="Learning Illustration"
                className="w-full max-w-md"
              />
            </div>
          </div>
        </main>
      </div>

      {/* Service Section */}
      <div className="mt-16 px-8">
        <div className="flex-1 justify-center">
          <div className="grid grid-cols-2 gap-8 items-start w-full max-w-[90%]"> {/* Changed items-center to items-start */}
            {/* Left Side: Card */}
            <div className="flex justify-center pl-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm transform transition duration-300 hover:scale-105">
                <div className="flex justify-center">
                  <div className="bg-gray-100 rounded-full p-5">
                    <img 
                      src="/p6.png" 
                      alt="Plan Icon" 
                      className="w-20 h-30 object-contain" 
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-5 text-center">Better Plan</h3>
                <p className="text-gray-600 text-center mt-3">
                  Perfect for students seeking enhanced features to boost productivity and track their study journey with ease.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link href="purchases">
                  <button className="button2 text-white font-medium px-5 py-2 rounded-lg transition duration-200">
                    Purchase
                  </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side: Section Header */}
            <div className="pr-4 flex flex-col justify-center h-full"> {/* Added flex and justify-center */}
              <h2 className="text-3xl font-bold">Flexible Study Plans for Every Learner</h2>
              <p className="mt-3 text-gray-600">
                Unleash your full potential with our tailored plans built for students like you.
              </p>
            </div>
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