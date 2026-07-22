import React, { useState } from 'react';

export default function TrackerView({ currentOrder, onCancelOrder, setCurrentPage, showToast }) {
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'rider', text: 'Konnichiwa! I am flying over Elmore High with your hot burgers! ' },
    { sender: 'rider', text: 'Opening Anywhere Door in 5 minutes! Delivery OTP is 4892.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [riderRating, setRiderRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [addedTip, setAddedTip] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const orderId = currentOrder?.id;
  const orderNumber = currentOrder?.orderNumber;
  const orderStatus = currentOrder?.status;
  const otpCode = currentOrder?.otp || "Available from your delivery partner";

  const isOutForDelivery = orderStatus === "Out for Delivery" || orderStatus === "Delivered";
  const isDelivered = orderStatus === "Delivered";
  const canCancel = orderStatus === "Placed" || orderStatus === "Preparing";

  // Show celebration once on Delivered
  React.useEffect(() => {
    if (isDelivered) setShowCelebration(true);
  }, [isDelivered]);

  const handleRateRider = (stars) => {
    setRiderRating(stars);
    setRatingSubmitted(true);
    if (showToast) showToast(`Rated Doraemon Rider ${stars}  — Thanks for your feedback!`, 'success');
  };

  const handleTipRider = (amount) => {
    setAddedTip(amount);
    if (showToast) showToast(`Added ₹${amount.toFixed(2)} tip for Doraemon Rider!`, 'success');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: inputMessage }]);
    const userMsg = inputMessage;
    setInputMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'rider', text: `Roger that! "${userMsg}" received. Flying faster! ` }]);
    }, 1200);
  };

  if (!currentOrder) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center rounded-3xl border-4 border-[#1a1c1c] bg-white p-10 text-center shadow-[8px_8px_0px_0px_#111111]">
        <h2 className="text-2xl font-black uppercase">No active order</h2>
        <p className="my-3 text-sm font-bold text-gray-600">Place an order to see its verified status timeline here.</p>
        <button type="button" onClick={() => setCurrentPage('menu')} className="rounded-xl border-2 border-black bg-[#FFD23F] px-6 py-3 text-xs font-black uppercase">Browse menu</button>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    if (!isDelivered) {
      if (showToast) showToast("Invoice will be unlocked after order is Delivered!", "warning");
      return;
    }
    if (showToast) showToast(`Downloading Invoice PDF for Order #${orderNumber}... `, "success");
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-5xl mx-auto px-4">
      {/* Doraemon Header Banner */}
      <div className="w-full bg-[#00A0E9] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 text-white text-center flex flex-col items-center gap-3">
        <div className="bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] px-4 py-1 rotate-[-2deg] font-black text-xs uppercase tracking-widest flex items-center gap-1">
          <span className="material-symbols-outlined text-sm font-black">door_front</span>
          HERO TRACKER & 4D ANYWHERE DOOR
        </div>
        <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-white drop-shadow-[3px_3px_0px_#1a1c1c]">
          HERO TRACKER COMMAND CENTER
        </h1>
        <p className="text-xs font-black uppercase tracking-wider text-[#1a1c1c] bg-white border-2 border-[#1a1c1c] px-4 py-1 rounded-full shadow-[2px_2px_0px_0px_#FFD23F]">
          LIVE ORDER #{orderNumber} DISPATCH • STATUS: {orderStatus.toUpperCase()}
        </p>
      </div>

      {/* 4D Anywhere Door Interactive Tracker Card */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 md:p-8 rounded-3xl mb-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-[#1a1c1c] pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFD23F] border-3 border-[#1a1c1c] rounded-2xl flex items-center justify-center font-black text-2xl shadow-[2px_2px_0px_0px_#111111]">
              <span className="material-symbols-outlined text-2xl font-black text-[#1a1c1c]">map</span>
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">LIVE GPS: ORDER #{orderNumber}</h2>
              <span className="text-xs font-bold text-gray-600">Nobita's House Coordinates • Anywhere Door Express</span>
            </div>
          </div>

          {/* Delivery OTP Badge — Shown ONLY when Out for Delivery */}
          {isOutForDelivery ? (
            <div className="flex items-center gap-2 animate-fadeIn">
              <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-3 py-1 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_0px_#111111]">
                DELIVERY OTP: {otpCode}
              </span>
            </div>
          ) : (
            <div className="bg-yellow-100 border-2 border-[#1a1c1c] px-3 py-1 rounded-xl text-xs font-black text-[#1a1c1c]">
              OTP UNLOCKS AT OUT FOR DELIVERY
            </div>
          )}
        </div>

        {/* Rider Profile Bar */}
        <div className="bg-[#FFF8E7] border-3 border-[#1a1c1c] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00A0E9] text-white border-2 border-[#1a1c1c] rounded-full flex items-center justify-center font-black text-lg">
              
            </div>
            <div>
              <h4 className="font-black text-sm uppercase">DORAEMON RIDER #42 (RATING:  4.9)</h4>
              <span className="text-xs font-bold text-gray-600">ANYWHERE DOOR FLYING DISPATCHER</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowChatModal(true)}
              className="px-3 py-1.5 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
            >
              CHAT RIDER 
            </button>
            <button
              type="button"
              onClick={() => alert("Calling Doraemon Rider on 555-4892...")}
              className="px-3 py-1.5 bg-[#00F0FF] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
            >
              CALL 
            </button>
          </div>
        </div>

        {/* Anywhere Pink Door & Animated Flight Bar */}
        <div className="w-full bg-[#fff7fb] border-4 border-[#1a1c1c] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="w-44 h-56 bg-[#FF70A6] border-6 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-t-3xl rounded-b-xl flex flex-col justify-between p-4 relative shrink-0">
            <div className="w-6 h-6 bg-[#FFD23F] border-2 border-[#1a1c1c] rounded-full absolute right-3 top-1/2 -translate-y-1/2 shadow-sm"></div>
            <span className="bg-[#1a1c1c] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase text-center">
              4D TELEPORT
            </span>
            <div className="text-center font-black text-xs text-white uppercase bg-black/40 p-2 rounded-lg">
              {orderStatus.toUpperCase()}...
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col gap-4">
            <div className="bg-white border-3 border-[#1a1c1c] p-4 rounded-2xl shadow-[3px_3px_0px_0px_#111111] flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-black">
                <span>ANYWHERE DOOR ETA</span>
                <span className="text-[#00A0E9]">07 MINS 45 SECS</span>
              </div>
              <div className="w-full h-4 bg-gray-200 border-2 border-[#1a1c1c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A0E9] border-r-2 border-[#1a1c1c] transition-all duration-1000"
                  style={{
                    width: orderStatus === 'Placed' ? '25%' : orderStatus === 'Preparing' ? '50%' : orderStatus === 'Cooking' ? '75%' : '98%'
                  }}
                ></div>
              </div>
            </div>

            {/* Stage Timeline Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-black uppercase text-center">
              <div className={`p-2 rounded-xl border-2 border-[#1a1c1c] ${orderStatus === 'Placed' ? 'bg-[#FFD23F]' : 'bg-gray-100'}`}>1. PLACED</div>
              <div className={`p-2 rounded-xl border-2 border-[#1a1c1c] ${orderStatus === 'Preparing' ? 'bg-[#FFD23F]' : 'bg-gray-100'}`}>2. PREPARING</div>
              <div className={`p-2 rounded-xl border-2 border-[#1a1c1c] ${orderStatus === 'Cooking' ? 'bg-[#FFD23F]' : 'bg-gray-100'}`}>3. COOKING</div>
              <div className={`p-2 rounded-xl border-2 border-[#1a1c1c] ${isOutForDelivery ? 'bg-[#34C759] text-white' : 'bg-gray-100'}`}>4. OUT FOR DELIVERY</div>
            </div>
          </div>
        </div>

        {/* Action Controls: Rider Chat, Cancel Order & Download Invoice */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t-3 border-dashed border-[#1a1c1c]">
          {canCancel ? (
            <button
              type="button"
              onClick={() => onCancelOrder && onCancelOrder(orderId)}
              className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-red-600 cursor-pointer"
            >
              CANCEL ORDER  (BEFORE COOKING)
            </button>
          ) : (
            <span className="text-xs font-bold text-gray-500 italic">
              Order cannot be cancelled once cooking starts.
            </span>
          )}

          <button
            type="button"
            onClick={handleDownloadInvoice}
            className={`w-full sm:w-auto px-6 py-3 border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] font-black text-xs uppercase rounded-xl cursor-pointer ${
              isDelivered ? 'bg-[#34C759] text-white hover:bg-green-600' : 'bg-gray-200 text-gray-500 opacity-60'
            }`}
          >
            {isDelivered ? 'DOWNLOAD PDF INVOICE ' : 'INVOICE (UNLOCKS AFTER DELIVERY)'}
          </button>
        </div>
      </div>

      {/*  Delivery Celebration Banner */}
      {isDelivered && showCelebration && (
        <div className="w-full bg-[#34C759] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-8 mb-8 text-center animate-bounce">
          <div className="text-5xl mb-2"></div>
          <h2 className="font-display-xl text-3xl font-black uppercase">ORDER DELIVERED!</h2>
          <p className="text-xs font-bold text-green-100 mt-1">Your cartoon feast has arrived at your Secret Base! Enjoy every bite!</p>
          <button type="button" onClick={() => setShowCelebration(false)} className="mt-3 px-4 py-2 bg-white text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">
            DISMISS 
          </button>
        </div>
      )}

      {/*  Rate Rider (post-delivery only) */}
      {isDelivered && (
        <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 mb-8 space-y-4">
          <h3 className="font-black text-lg uppercase border-b-3 border-[#1a1c1c] pb-2"> RATE YOUR DORAEMON RIDER</h3>
          {ratingSubmitted ? (
            <div className="bg-[#FFD23F] border-2 border-[#1a1c1c] p-4 rounded-2xl text-center font-black text-sm uppercase">
               You rated {riderRating}  — Thank you for your feedback!
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => handleRateRider(star)}
                  className={`w-12 h-12 border-3 border-[#1a1c1c] rounded-2xl font-black text-2xl cursor-pointer shadow-[2px_2px_0px_0px_#111111] transition-transform hover:scale-110 ${riderRating >= star ? 'bg-[#FFD23F]' : 'bg-gray-100'}`}>
                  
                </button>
              ))}
            </div>
          )}

          {/* Tip Rider */}
          <div className="border-t-2 border-dashed border-[#1a1c1c] pt-4">
            <h4 className="font-black text-xs uppercase mb-3"> ADD POST-DELIVERY TIP</h4>
            <div className="flex gap-2 justify-start flex-wrap">
              {[0, 1, 2, 5, 10].map(amt => (
                <button key={amt} type="button" onClick={() => handleTipRider(amt)}
                  className={`px-4 py-2 border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer ${addedTip === amt ? 'bg-[#34C759] text-white' : 'bg-gray-100'}`}>
                  {amt === 0 ? 'NO TIP' : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal Drawer */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl w-full max-w-lg space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b-3 border-[#1a1c1c] pb-3">
              <h3 className="font-black text-lg uppercase">DORAEMON RIDER COMMS</h3>
              <button
                onClick={() => setShowChatModal(false)}
                className="w-8 h-8 bg-gray-200 border-2 border-[#1a1c1c] rounded-full font-black"
              >
                
              </button>
            </div>

            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-[#fcfbf7] border-2 border-[#1a1c1c] rounded-2xl text-xs font-bold">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] border-2 border-[#1a1c1c] ${msg.sender === 'user' ? 'bg-[#00F0FF] text-[#1a1c1c]' : 'bg-[#FFD23F] text-[#1a1c1c]'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message to rider..."
                className="flex-1 p-3 border-2 border-[#1a1c1c] rounded-xl text-xs font-bold bg-white"
              />
              <button type="submit" className="px-5 py-3 bg-[#FF0055] text-white font-black text-xs uppercase border-2 border-[#1a1c1c] rounded-xl">
                SEND
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
