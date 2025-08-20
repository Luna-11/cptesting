"use client";

import { useState, useEffect } from "react";

interface Purchase {
  id: string;
  planName: string;
  months: number;
  amount: number;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  paymentMethod?: string;
  receiptUrl?: string;
}

const PaymentPage = () => {
  const MONTHLY_PRICE = 49.99;
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<"KBZPay" | "WavePay">("KBZPay");
  const [preview, setPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch purchase history from backend
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/payments');
        const data = await response.json();
        
        if (data.success) {
          setPurchases(data.payments.map((payment: any) => ({
            id: payment.payment_id.toString(),
            planName: `Pro Plan (${payment.months} month${payment.months > 1 ? 's' : ''})`,
            months: payment.months,
            amount: payment.amount,
            date: payment.payment_date,
            status: payment.status,
            paymentMethod: payment.method_name,
            receiptUrl: payment.receipt_image 
              ? `data:image/jpeg;base64,${payment.receipt_image}`
              : undefined
          })));
        }
      } catch (error) {
        console.error('Failed to fetch purchases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [uploadSuccess]);

  const calculatePrice = (months: number) => {
    return parseFloat((MONTHLY_PRICE * months).toFixed(2));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    
    setIsUploading(true);
    setUploadSuccess(false);
    
    try {
      // Extract base64 data without the prefix
      const base64Data = preview.split(',')[1];
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          methodId: selectedMethod === "KBZPay" ? 1 : 2,
          months: selectedMonths,
          amount: calculatePrice(selectedMonths),
          receiptImage: base64Data
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setUploadSuccess(true);
      setPreview(""); // Clear preview after successful upload
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const incrementMonths = () => setSelectedMonths(prev => Math.min(prev + 1, 12));
  const decrementMonths = () => setSelectedMonths(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-[#f0eeee] min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-[#3d312e] crimson-text-bold">Upgrade to Pro Plan</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-[#bba2a2]">
        <h2 className="text-xl font-bold mb-4 text-[#3d312e] crimson-text-semibold">Subscription Options</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#3d312e] mb-3">
            Select Duration:
          </label>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[#bba2a2] rounded-lg overflow-hidden">
              <button 
                onClick={decrementMonths}
                className="px-3 py-1 bg-[#f0eeee] text-[#3d312e] hover:bg-[#bba2a2] hover:text-[#f0eeee] transition"
                disabled={selectedMonths <= 1}
              >
                -
              </button>
              <div className="px-4 py-1 bg-white text-center min-w-[50px]">
                {selectedMonths}
              </div>
              <button 
                onClick={incrementMonths}
                className="px-3 py-1 bg-[#f0eeee] text-[#3d312e] hover:bg-[#bba2a2] hover:text-[#f0eeee] transition"
                disabled={selectedMonths >= 12}
              >
                +
              </button>
            </div>
            <span className="text-[#3d312e]">months</span>
          </div>
          
          <div className="mb-4 p-4 bg-[#f0eeee] rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#3d312e]">Monthly Price:</span>
              <span className="font-medium">${MONTHLY_PRICE}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#3d312e]">Duration:</span>
              <span className="font-medium">
                {selectedMonths} month{selectedMonths > 1 ? 's' : ''}
              </span>
            </div>
            <div className="border-t border-[#bba2a2] my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#3d312e]">Total Amount:</span>
              <span className="text-xl font-bold text-[#3d312e]">
                ${calculatePrice(selectedMonths)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-medium mb-3 text-[#3d312e]">Transfer to:</h3>
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded-lg border ${
                selectedMethod === "KBZPay"
                  ? "bg-[#bba2a2] border-[#3d312e] text-[#f0eeee]"
                  : "border-[#bba2a2] text-[#3d312e]"
              }`}
              onClick={() => setSelectedMethod("KBZPay")}
            >
              KBZPay: 09424979727
            </button>
            <button
              className={`px-4 py-2 rounded-lg border ${
                selectedMethod === "WavePay"
                  ? "bg-[#bba2a2] border-[#3d312e] text-[#f0eeee]"
                  : "border-[#bba2a2] text-[#3d312e]"
              }`}
              onClick={() => setSelectedMethod("WavePay")}
            >
              WavePay: 09424979727
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#3d312e] mb-2">
              Upload Payment Screenshot
            </label>
            
            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="Payment receipt"
                  className="max-w-xs border border-[#bba2a2] rounded shadow-sm"
                />
                <div className="flex gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0eeee] text-[#3d312e] text-sm rounded cursor-pointer hover:bg-[#bba2a2] hover:text-[#f0eeee] transition">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {!uploadSuccess && (
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-4 py-2 bg-[#3d312e] text-[#f0eeee] text-sm rounded hover:bg-[#bba2a2] transition disabled:bg-[#bba2a2] disabled:opacity-70"
                    >
                      {isUploading ? "Uploading..." : "Confirm Payment"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#3d312e] text-[#f0eeee] text-sm rounded cursor-pointer hover:bg-[#bba2a2] transition">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
            
            {uploadSuccess && (
              <div className="mt-3 p-3 bg-green-100 text-green-800 rounded-lg">
                Receipt uploaded successfully! Your payment is under review.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-[#bba2a2]">
        <h2 className="text-xl font-bold mb-4 text-[#3d312e] crimson-text-semibold">Purchase History</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3d312e]"></div>
          </div>
        ) : purchases.length === 0 ? (
          <p className="text-[#3d312e]">No purchase history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#bba2a2]">
              <thead className="bg-[#f0eeee]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#3d312e] uppercase tracking-wider">Method</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#bba2a2]">
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#3d312e]">{purchase.planName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3d312e]">{purchase.months} month{purchase.months > 1 ? 's' : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3d312e]">${purchase.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3d312e]">
                      {new Date(purchase.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${purchase.status === "Approved" ? "bg-green-100 text-green-800" : 
                          purchase.status === "Rejected" ? "bg-red-100 text-red-800" : 
                          "bg-[#bba2a2] text-[#3d312e]"}`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3d312e]">
                      {purchase.paymentMethod || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;