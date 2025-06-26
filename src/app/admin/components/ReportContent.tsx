'use client';
import { Report } from '../type';

// Sample data
const reports: Report[] = [
  { id: 1, title: "Monthly Usage Report - June 2023", date: "2023-06-01", type: "Usage", downloadUrl: "#" },
  { id: 2, title: "User Activity Analysis", date: "2023-05-28", type: "Activity", downloadUrl: "#" },
  { id: 3, title: "Q2 Financial Summary", date: "2023-04-15", type: "Financial", downloadUrl: "#" },
  { id: 4, title: "Weekly Engagement Metrics", date: "2023-06-12", type: "Activity", downloadUrl: "#" },
];

export default function ReportsContent() {
  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: '#3d312e' }}>Report Type</label>
              <select 
                className="w-full px-4 py-2 rounded-lg transition-all duration-200 focus:shadow-md focus:outline-none"
                style={{ border: '1px solid #bba2a2', backgroundColor: '#f0eeee' }}
              >
                <option>Usage Report</option>
                <option>Activity Report</option>
                <option>Financial Report</option>
                <option>User Engagement Report</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3d312e' }}>Start Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 rounded-lg transition-all duration-200 focus:shadow-md focus:outline-none"
                  style={{ border: '1px solid #bba2a2', backgroundColor: '#f0eeee' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#3d312e' }}>End Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 rounded-lg transition-all duration-200 focus:shadow-md focus:outline-none"
                  style={{ border: '1px solid #bba2a2', backgroundColor: '#f0eeee' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#3d312e' }}>Filters (optional)</label>
              <input 
                type="text" 
                placeholder="E.g., user role, subscription type..."
                className="w-full px-4 py-2 rounded-lg transition-all duration-200 focus:shadow-md focus:outline-none"
                style={{ border: '1px solid #bba2a2', backgroundColor: '#f0eeee' }}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: '#3d312e' }}>Report Options</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm" style={{ color: '#3d312e' }}>Include charts</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm" style={{ color: '#3d312e' }}>Detailed user data</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked />
                  <span className="text-sm" style={{ color: '#3d312e' }}>Summary statistics</span>
                </label>
              </div>
            </div>
            <button 
              className="w-full px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-90 mt-4"
              style={{ backgroundColor: '#3d312e', color: '#f0eeee' }}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Previous Reports */}
      <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-lg" style={{ backgroundColor: '#f0eeee', border: '1px solid #bba2a2' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#3d312e' }}>Previous Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: '#bba2a2' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0eeee' }}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#3d312e' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#bba2a2' }}>
              {reports.map(report => (
                <tr 
                  key={report.id} 
                  className="transition-all duration-200 hover:bg-[#e0d8d8] hover:shadow-md"
                  style={{ backgroundColor: '#f0eeee' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#3d312e' }}>{report.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#3d312e' }}>{report.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-200 ${
                      report.type === "Financial" ? "bg-[#3d312e] text-[#f0eeee] hover:shadow-md" :
                      report.type === "Activity" ? "bg-[#948585] text-[#f0eeee] hover:shadow-md" :
                      "bg-[#bba2a2] text-[#3d312e] hover:shadow-md"
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="mr-3 transition-all duration-200 hover:text-[#948585] hover:underline" 
                      style={{ color: '#3d312e' }}
                    >
                      View
                    </button>
                    <button 
                      className="mr-3 transition-all duration-200 hover:text-[#948585] hover:underline" 
                      style={{ color: '#3d312e' }}
                    >
                      Download
                    </button>
                    <button 
                      className="transition-all duration-200 hover:text-[#3d312e] hover:underline" 
                      style={{ color: '#948585' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}