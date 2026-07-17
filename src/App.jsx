import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, X, Star, RotateCcw, Zap, Settings, MessageCircle, User, 
  Sparkles, Shield, Info, ChevronLeft, ChevronRight, Send, Compass, LogOut 
} from "lucide-react";
import { mockProfiles } from "./data/mockProfiles";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

// Presets for client profile photos
const CLIENT_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
];

function App() {
  // Navigation / Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Client User Profile
  const [userProfile, setUserProfile] = useState({
    name: "Alex",
    age: 25,
    gender: "non-binary",
    bio: "Product engineer & adventure seeker. Always down for coffee!",
    avatar: CLIENT_AVATARS[0],
    preferredGender: "everyone",
    distanceLimit: 15,
    ageRange: [18, 35],
    vipTier: "free" // free, gold, platinum
  });

  // Card Deck swiping states
  const [deck, setDeck] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]); // tracks past swiped profiles
  const [activeExplore, setActiveExplore] = useState("all");
  const [expandedProfile, setExpandedProfile] = useState(null); // detailed view drawer
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dragging and Animation State for top card
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false });
  const [swipeAnim, setSwipeAnim] = useState(null); // 'left' | 'right' | 'up'
  const dragStart = useRef({ x: 0, y: 0 });

  // Matching & Chat States
  const [matchedProfile, setMatchedProfile] = useState(null); // For It's a Match popup
  const [matchGreeting, setMatchGreeting] = useState("");
  const [matches, setMatches] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("matches"); // matches | messages | explore

  // Visual Effects
  const [toast, setToast] = useState({ show: false, message: "" });
  const [boostActive, setBoostActive] = useState(false);

  // Toast System
  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Keyboard navigation for card swiping
  useEffect(() => {
    if (!isLoggedIn || showSettingsModal || showPremiumModal || matchedProfile || selectedChat) return;

    const handleKeyDown = (e) => {
      if (expandedProfile) {
        if (e.key === "Escape" || e.key === "ArrowDown" || e.key === " ") {
          setExpandedProfile(null);
        }
        return;
      }
      if (e.key === "ArrowLeft") handleSwipeAction("left");
      if (e.key === "ArrowRight") handleSwipeAction("right");
      if (e.key === "ArrowUp") handleSwipeAction("up");
      if (e.key === " ") {
        e.preventDefault();
        if (deck[currentIndex]) setExpandedProfile(deck[currentIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoggedIn, currentIndex, deck, expandedProfile, showSettingsModal, showPremiumModal, matchedProfile, selectedChat]);

  // Sync / filter deck based on explore filters and gender preferences
  useEffect(() => {
    let filtered = mockProfiles;

    // Filter by Gender Preference
    if (userProfile.preferredGender !== "everyone") {
      filtered = filtered.filter(p => p.gender === userProfile.preferredGender);
    }

    // Filter by Explore selections
    if (activeExplore !== "all") {
      filtered = filtered.filter(p => 
        p.interests.some(interest => interest.toLowerCase() === activeExplore.toLowerCase())
      );
    }

    setDeck(filtered);
    setCurrentIndex(0);
    setActiveImageIndex(0);
  }, [userProfile.preferredGender, activeExplore]);

  // Drag physics tracking
  useEffect(() => {
    if (!drag.isDragging) return;

    const handleMouseMove = (e) => {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
      setDrag(prev => ({
        ...prev,
        x: clientX - dragStart.current.x,
        y: clientY - dragStart.current.y
      }));
    };

    const handleMouseUp = () => {
      const thresholdX = 130;
      const thresholdY = 110;

      if (drag.x > thresholdX) {
        executeSwipe("right");
      } else if (drag.x < -thresholdX) {
        executeSwipe("left");
      } else if (drag.y < -thresholdY) {
        executeSwipe("up");
      } else {
        // bounce back
        setDrag({ x: 0, y: 0, isDragging: false });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [drag.isDragging, drag.x, drag.y]);

  const handleCardDragStart = (e) => {
    if (expandedProfile) return;
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
    dragStart.current = { x: clientX, y: clientY };
    setDrag({ x: 0, y: 0, isDragging: true });
  };

  // Trigger swiping actions via buttons
  const handleSwipeAction = (direction) => {
    if (currentIndex >= deck.length) return;
    setSwipeAnim(direction);
    setTimeout(() => {
      executeSwipe(direction);
      setSwipeAnim(null);
    }, 450);
  };

  // Perform core swipe and logic updates
  const executeSwipe = (direction) => {
    const swipedUser = deck[currentIndex];
    if (!swipedUser) return;

    // Push into undo stack history
    setHistory(prev => [...prev, { index: currentIndex, profile: swipedUser }]);

    // Move to next card
    setCurrentIndex(prev => prev + 1);
    setActiveImageIndex(0);
    setDrag({ x: 0, y: 0, isDragging: false });

    // Matching logic for LIKE/SUPER LIKE (35% probability)
    if (direction === "right" || direction === "up") {
      const matchChance = Math.random() < 0.35 || boostActive;
      if (matchChance) {
        // Trigger Match
        setTimeout(() => {
          setMatchedProfile(swipedUser);
          setMatchGreeting(`Hey ${swipedUser.name}! Let's chat!`);
        }, 600);
      }
    }
  };

  // Undo (Tinder Gold/Platinum feature)
  const handleUndo = () => {
    if (userProfile.vipTier === "free") {
      triggerToast("Unlock Rewinds with Finder Gold!");
      setShowPremiumModal(true);
      return;
    }
    if (history.length === 0) {
      triggerToast("Nothing to Rewind!");
      return;
    }
    const lastAction = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(lastAction.index);
    setActiveImageIndex(0);
    triggerToast(`Rewound ${lastAction.profile.name}!`);
  };

  // Tinder Boost Active
  const handleBoost = () => {
    if (userProfile.vipTier === "free") {
      triggerToast("Purchase Premium to Boost your Profile!");
      setShowPremiumModal(true);
      return;
    }
    setBoostActive(true);
    triggerToast("Your profile is BOOSTED for 30 minutes!");
    setTimeout(() => setBoostActive(false), 5000);
  };

  // Create match from match modal popup
  const confirmMatch = () => {
    if (!matchedProfile) return;
    
    // Add to matches active list
    const newChatId = matchedProfile.id;
    const newMatch = {
      id: newChatId,
      profile: matchedProfile,
      lastMessage: matchGreeting || "It's a Match!",
      time: "Just Now",
      unread: true,
      messages: [{ sender: "user", text: matchGreeting || "Hi! Let's chat!", time: "Just Now" }]
    };

    setMatches(prev => [newMatch, ...prev]);
    setSidebarTab("messages");
    setSelectedChat(newMatch.id);
    setMatchedProfile(null);
    setMatchGreeting("");
    triggerToast(`Matched with ${matchedProfile.name}!`);

    // Bot reply trigger
    simulateBotReply(newChatId, matchedProfile);
  };

  // Send message inside chat view
  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedChat) return;

    const messageText = chatInput.trim();
    setChatInput("");

    // Append user message
    setMatches(prevMatches => 
      prevMatches.map(m => {
        if (m.id === selectedChat) {
          return {
            ...m,
            lastMessage: messageText,
            time: "Just Now",
            unread: false,
            messages: [...m.messages, { sender: "user", text: messageText, time: "Just Now" }]
          };
        }
        return m;
      })
    );

    // Find the current partner profile data
    const activeMatch = matches.find(m => m.id === selectedChat);
    if (activeMatch) {
      simulateBotReply(selectedChat, activeMatch.profile);
    }
  };

  // Simulated typing delay + bot reply
  const simulateBotReply = (chatId, partnerProfile) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      // Select appropriate canned response based on message count
      const matchObj = matches.find(m => m.id === chatId);
      const conversationLength = matchObj ? matchObj.messages.length : 0;
      const responseIndex = Math.min(conversationLength, partnerProfile.conversationResponses.length - 1);
      const replyText = partnerProfile.conversationResponses[responseIndex] || "Awesome! Let's meet up sometime.";

      setMatches(prevMatches => 
        prevMatches.map(m => {
          if (m.id === chatId) {
            return {
              ...m,
              lastMessage: replyText,
              time: "Just Now",
              messages: [...m.messages, { sender: "partner", text: replyText, time: "Just Now" }]
            };
          }
          return m;
        })
      );
    }, 2000);
  };

  // Explore categories filtration
  const exploreCategories = [
    { id: "all", title: "All Profiles", img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80", subtitle: "Everyone available" },
    { id: "coffee", title: "Coffee Date", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80", subtitle: "Caffeine lovers" },
    { id: "gaming", title: "Gamers", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80", subtitle: "Controller friendly" },
    { id: "music", title: "Music Lovers", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80", subtitle: "Concert goers" },
    { id: "art", title: "Art & DIY", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80", subtitle: "Creative minds" }
  ];

  // Helper for image carousel inside swiping card
  const handleCarouselNext = (e, totalImages) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev + 1) % totalImages);
  };

  const handleCarouselPrev = (e, totalImages) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev - 1 + totalImages) % totalImages);
  };

  // Reset Deck
  const handleResetDeck = () => {
    setCurrentIndex(0);
    setActiveImageIndex(0);
    setHistory([]);
    triggerToast("Deck reloaded!");
  };

  return (
    <>
      {/* Toast Notice */}
      <div className={`toast-notice ${toast.show ? "show" : ""}`}>
        <Sparkles size={16} /> {toast.message}
      </div>

      {/* Boost screen-flash visual effect */}
      {boostActive && (
        <div className="fullscreen-boost-overlay">
          <div className="boost-vfx-title">BOOST ACTIVE!⚡</div>
          <div className="boost-vfx-text">Your profile is highlighted nearby. More matches coming!</div>
        </div>
      )}

      {/* LANDING PAGE VIEW */}
      {!isLoggedIn && (
        <div className="landing-container">
          <Navbar onSignInClick={() => setShowLoginModal(true)} />
          <div className="landing-hero">
            <h1>Swipe Right®</h1>
            <p>Finder helps you build genuine connections based on compatibility, lifestyle preference, and meaningful conversations.</p>
            <button className="btn-primary-gradient" onClick={() => setShowLoginModal(true)}>
              Create Account
            </button>
          </div>
          <Features />
          <Footer />
        </div>
      )}

      {/* MAIN APP VIEW */}
      {isLoggedIn && (
        <div className="dashboard-container">
          {/* SIDEBAR PANEL */}
          <div className="sidebar">
            <div className="sidebar-header">
              <button className="profile-link" onClick={() => setShowSettingsModal(true)}>
                <img 
                  src={userProfile.avatar} 
                  alt="avatar" 
                  className={`profile-link-avatar ${
                    userProfile.vipTier === "gold" ? "avatar-badge-gold" : 
                    userProfile.vipTier === "platinum" ? "avatar-badge-platinum" : ""
                  }`}
                />
                <span className="profile-link-name">{userProfile.name}</span>
              </button>
              <div className="sidebar-header-actions">
                <button className="btn-icon-sidebar" title="Settings" onClick={() => setShowSettingsModal(true)}>
                  <Settings size={18} />
                </button>
                <button className="btn-icon-sidebar" title="Sign Out" onClick={() => {
                  setIsLoggedIn(false);
                  setSelectedChat(null);
                  setMatches([]);
                }}>
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            {/* Premium Promo banner */}
            {userProfile.vipTier === "free" && (
              <div className="sidebar-promo" onClick={() => setShowPremiumModal(true)}>
                <div className="promo-title">
                  <Sparkles size={16} />
                  <span>Get Finder Gold</span>
                </div>
                <div className="promo-action">Upgrade</div>
              </div>
            )}
            {userProfile.vipTier === "gold" && (
              <div className="sidebar-promo" style={{ background: "var(--gold-gradient)" }} onClick={() => setShowPremiumModal(true)}>
                <div className="promo-title">
                  <Sparkles size={16} />
                  <span>Finder Gold Active</span>
                </div>
              </div>
            )}
            {userProfile.vipTier === "platinum" && (
              <div className="sidebar-promo is-vip" onClick={() => setShowPremiumModal(true)}>
                <div className="promo-title">
                  <Sparkles size={16} />
                  <span>Finder Platinum Active</span>
                </div>
              </div>
            )}

            {/* Tabs navigations */}
            <div className="sidebar-tabs">
              <button 
                className={`sidebar-tab ${sidebarTab === "matches" && !selectedChat ? "active" : ""}`}
                onClick={() => { setSelectedChat(null); setSidebarTab("matches"); }}
              >
                Matches
              </button>
              <button 
                className={`sidebar-tab ${sidebarTab === "messages" || selectedChat ? "active" : ""}`}
                onClick={() => { setSidebarTab("messages"); }}
              >
                Messages
              </button>
              <button 
                className={`sidebar-tab ${sidebarTab === "explore" && !selectedChat ? "active" : ""}`}
                onClick={() => { setSelectedChat(null); setSidebarTab("explore"); }}
              >
                Explore
              </button>
            </div>

            {/* Sidebar content */}
            <div className="sidebar-content">
              {/* CHAT DISPLAY SECTION (When chat is active) */}
              {selectedChat ? (
                <div className="active-chat-container">
                  {(() => {
                    const currentChatObj = matches.find(m => m.id === selectedChat);
                    if (!currentChatObj) return null;
                    return (
                      <>
                        <div className="active-chat-header">
                          <img src={currentChatObj.profile.images[0]} alt="avatar" className="active-chat-avatar" />
                          <div className="active-chat-info">
                            <div className="active-chat-name">{currentChatObj.profile.name}</div>
                            <div className="active-chat-status">
                              <span className="match-dot" style={{ position: "static", display: "inline-block", width: "8px", height: "8px", background: "var(--tinder-green)" }} />
                              Online
                            </div>
                          </div>
                          <button className="btn-icon-sidebar" onClick={() => setSelectedChat(null)}>
                            Back
                          </button>
                        </div>
                        <div className="active-chat-messages">
                          {currentChatObj.messages.map((msg, idx) => (
                            <div key={idx} className={`message-bubble-wrapper ${msg.sender === "user" ? "sent" : "received"}`}>
                              <div className="message-bubble">{msg.text}</div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="typing-indicator">
                              <div className="typing-dot" />
                              <div className="typing-dot" />
                              <div className="typing-dot" />
                            </div>
                          )}
                        </div>
                        <div className="active-chat-input-area">
                          <input 
                            type="text" 
                            className="chat-input"
                            placeholder="Type a message..." 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          />
                          <button className="btn-send-message" onClick={handleSendMessage}>
                            <Send size={16} />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                /* TAB PANELS: EXPLORE, CHATS, MATCHES */
                <>
                  {sidebarTab === "explore" && (
                    <div className="explore-grid">
                      {exploreCategories.map(category => (
                        <div 
                          key={category.id} 
                          className={`explore-card ${activeExplore === category.id ? "active" : ""}`}
                          onClick={() => {
                            setActiveExplore(category.id);
                            triggerToast(`Filtering by ${category.title}`);
                          }}
                        >
                          <img src={category.img} alt={category.title} className="explore-card-img" />
                          <div className="explore-card-overlay">
                            <div className="explore-card-title">{category.title}</div>
                            <div className="explore-card-description">{category.subtitle}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sidebarTab === "matches" && (
                    <div className="matches-container">
                      <div className="matches-grid">
                        {matches.map(item => (
                          <div 
                            key={item.id} 
                            className="match-item new-match"
                            onClick={() => {
                              setSelectedChat(item.id);
                              setSidebarTab("messages");
                            }}
                          >
                            <div className="match-avatar-wrapper">
                              <img src={item.profile.images[0]} alt={item.profile.name} className="match-avatar" />
                              <span className="match-dot" />
                            </div>
                            <div className="match-name">{item.profile.name}</div>
                          </div>
                        ))}
                        {matches.length === 0 && (
                          <div style={{ gridColumn: "span 3", textAlign: "center", color: "var(--text-gray)", fontSize: "14px", marginTop: "30px" }}>
                            No matches yet. Right swipe on profiles to find a match!
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {sidebarTab === "messages" && (
                    <div className="chats-list">
                      {matches.map(item => (
                        <div 
                          key={item.id} 
                          className="chat-item"
                          onClick={() => setSelectedChat(item.id)}
                        >
                          <img src={item.profile.images[0]} alt={item.profile.name} className="chat-avatar" />
                          <div className="chat-details">
                            <div className="chat-name-row">
                              <span className="chat-name">{item.profile.name}</span>
                              <span className="chat-time">{item.time}</span>
                            </div>
                            <div className="chat-preview-row">
                              <span className="chat-preview">{item.lastMessage}</span>
                              {item.unread && <span className="chat-unread-dot" />}
                            </div>
                          </div>
                        </div>
                      ))}
                      {matches.length === 0 && (
                        <div style={{ textAlign: "center", color: "var(--text-gray)", fontSize: "14px", marginTop: "30px" }}>
                          No messages yet. Match with profiles first!
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* MAIN SWIPER INTERFACE */}
          <div className="main-swiper">
            <div className="deck-container">
              {(() => {
                const activeCard = deck[currentIndex];

                if (!activeCard) {
                  // Out of cards display
                  return (
                    <div className="out-of-cards">
                      <div className="radar-sonar">
                        <img src={userProfile.avatar} alt="search" className="radar-avatar" />
                        <div className="radar-wave" />
                        <div className="radar-wave" />
                        <div className="radar-wave" />
                      </div>
                      <h3>No one new nearby</h3>
                      <p>Try widening your preferences, choosing a different Explore group, or restart swiping.</p>
                      <button className="btn-primary-gradient" style={{ fontSize: "15px", padding: "10px 24px" }} onClick={handleResetDeck}>
                        Reset Deck
                      </button>
                    </div>
                  );
                }

                // Drag positioning Calculations
                const rotateCoeff = 0.08;
                const cardTransform = drag.isDragging 
                  ? `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.x * rotateCoeff}deg)`
                  : swipeAnim === "left" ? "translate3d(-1000px, 0, 0) rotate(-45deg)"
                  : swipeAnim === "right" ? "translate3d(1000px, 0, 0) rotate(45deg)"
                  : swipeAnim === "up" ? "translate3d(0, -1000px, 0) rotate(0deg)"
                  : "translate3d(0, 0, 0) rotate(0deg)";

                // Stamp Opacities
                const stampLikeOpacity = drag.isDragging && drag.x > 30 ? Math.min(1, (drag.x - 30) / 100) : 0;
                const stampNopeOpacity = drag.isDragging && drag.x < -30 ? Math.min(1, (-drag.x - 30) / 100) : 0;
                const stampSuperOpacity = drag.isDragging && drag.y < -30 ? Math.min(1, (-drag.y - 30) / 100) : 0;

                return (
                  <div 
                    className={`tinder-card ${drag.isDragging ? "" : "transitioning"} ${!expandedProfile ? "top-card" : ""}`}
                    style={{ transform: cardTransform }}
                    onMouseDown={handleCardDragStart}
                    onTouchStart={handleCardDragStart}
                  >
                    {/* Image media container */}
                    <div className="card-media-wrapper">
                      <img 
                        src={activeCard.images[activeImageIndex]} 
                        alt={activeCard.name} 
                        className="card-img" 
                      />

                      {/* Image navigation invisible taps */}
                      <div className="carousel-nav-layer">
                        <div className="carousel-zone" onClick={(e) => handleCarouselPrev(e, activeCard.images.length)} />
                        <div className="carousel-zone" onClick={(e) => handleCarouselNext(e, activeCard.images.length)} />
                      </div>

                      {/* Top Carousel indicators */}
                      <div className="carousel-dots">
                        {activeCard.images.map((img, idx) => (
                          <div key={idx} className={`carousel-dot ${activeImageIndex === idx ? "active" : ""}`} />
                        ))}
                      </div>

                      {/* Stamp Decals */}
                      <div className="stamp stamp-like" style={{ opacity: stampLikeOpacity || (swipeAnim === "right" ? 1 : 0) }}>Like</div>
                      <div className="stamp stamp-nope" style={{ opacity: stampNopeOpacity || (swipeAnim === "left" ? 1 : 0) }}>Nope</div>
                      <div className="stamp stamp-super" style={{ opacity: stampSuperOpacity || (swipeAnim === "up" ? 1 : 0) }}>Super Like</div>

                      {/* Description overlay */}
                      <div className="card-content-gradient" />
                      <div className="card-text">
                        <div className="card-row-info">
                          <span className="card-name">{activeCard.name}</span>
                          <span className="card-age">{activeCard.age}</span>
                        </div>
                        <div className="card-row-details">
                          <div className="card-row-detail-item">💼 {activeCard.job}</div>
                          <div className="card-row-detail-item">🎓 {activeCard.school}</div>
                          <div className="card-row-detail-item">📍 {activeCard.distance}</div>
                        </div>

                        {/* Tag Chips */}
                        <div className="card-tags">
                          {activeCard.interests.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="card-tag">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <button className="btn-card-info" onClick={() => setExpandedProfile(activeCard)}>
                        <Info size={16} />
                      </button>
                    </div>

                    {/* Detailed info extended drawer */}
                    {expandedProfile && (
                      <div className="profile-expanded-drawer">
                        <div className="drawer-header">
                          <img src={activeCard.images[activeImageIndex]} alt="carousel" className="drawer-img" />
                          <button className="btn-close-drawer" onClick={() => setExpandedProfile(null)}>
                            <X size={20} />
                          </button>
                        </div>
                        <div className="drawer-content">
                          <div className="drawer-heading-row">
                            <span className="drawer-title">{activeCard.name}</span>
                            <span className="drawer-age">{activeCard.age}</span>
                          </div>
                          <div className="drawer-subtitle-row">
                            <span>💼 {activeCard.job}</span>
                            <span>🎓 {activeCard.school}</span>
                            <span>📍 Located {activeCard.distance}</span>
                            <span>✨ Zodiac: {activeCard.zodiac}</span>
                          </div>

                          <div className="drawer-bio">
                            {activeCard.bio}
                          </div>

                          <div className="drawer-section">
                            <div className="drawer-section-title">Interests</div>
                            <div className="card-tags">
                              {activeCard.interests.map((tag, idx) => (
                                <span key={idx} className="card-tag" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>{tag}</span>
                              ))}
                            </div>
                          </div>

                          <div className="drawer-section">
                            <div className="drawer-section-title">My Spotify Song</div>
                            <div className="anthem-card">
                              <Compass size={22} className="anthem-icon" />
                              <div>
                                <div className="anthem-name">{activeCard.anthem.name}</div>
                                <div className="anthem-artist">{activeCard.anthem.artist}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom action trigger bar */}
            <div className="action-buttons-bar">
              <button className="btn-action-round btn-action-small btn-undo" title="Rewind Swipe" onClick={handleUndo}>
                <RotateCcw size={20} />
              </button>
              <button className="btn-action-round btn-action-large btn-nope" title="Nope (Swipe Left)" onClick={() => handleSwipeAction("left")}>
                <X size={32} />
              </button>
              <button className="btn-action-round btn-action-small btn-super" title="Super Like (Swipe Up)" onClick={() => handleSwipeAction("up")}>
                <Star size={20} />
              </button>
              <button className="btn-action-round btn-action-large btn-like" title="Like (Swipe Right)" onClick={() => handleSwipeAction("right")}>
                <Heart size={32} fill="currentColor" />
              </button>
              <button className="btn-action-round btn-action-small btn-boost" title="Profile Boost" onClick={handleBoost}>
                <Zap size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL OVERLAY */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowLoginModal(false)}>
              <X size={18} />
            </button>
            <div className="login-modal-inner">
              <div className="login-modal-logo">❤️ Finder</div>
              <p className="login-modal-subtitle">By clicking Log In, you agree to our Terms. Learn how we process your data in our Privacy Policy and Cookie Policy.</p>
              
              <div className="auth-providers">
                <button className="btn-auth-provider" onClick={() => triggerToast("Google Authentication Service down!")}>
                  Continue with Google
                </button>
                <button className="btn-auth-provider" onClick={() => triggerToast("Facebook OAuth connection timeout!")}>
                  Continue with Facebook
                </button>
                <button className="btn-auth-provider" onClick={() => triggerToast("SMS gateway disabled for this region!")}>
                  Continue with Phone Number
                </button>
                
                <button 
                  className="btn-auth-provider primary" 
                  onClick={() => {
                    setIsLoggedIn(true);
                    setShowLoginModal(false);
                    triggerToast("Logged in in Demo sandbox mode!");
                  }}
                >
                  🚀 Demo Run (Instant Sandbox)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS / PROFILE EDIT MODAL */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowSettingsModal(false)}>
              <X size={18} />
            </button>
            <div className="settings-body">
              <div className="settings-section">
                <div className="settings-section-title">Edit Profile Image</div>
                <div className="profile-avatar-selector">
                  {CLIENT_AVATARS.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url} 
                      alt={`Avatar Option ${idx}`} 
                      className={`avatar-option ${userProfile.avatar === url ? "selected" : ""}`}
                      onClick={() => setUserProfile(prev => ({ ...prev, avatar: url }))}
                    />
                  ))}
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-section-title">Account Information</div>
                <div className="form-group">
                  <label htmlFor="name">Display Name</label>
                  <input 
                    id="name"
                    type="text" 
                    className="form-input" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input 
                    id="age"
                    type="number" 
                    className="form-input" 
                    value={userProfile.age}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bio">About Me</label>
                  <textarea 
                    id="bio"
                    className="form-input" 
                    style={{ height: "80px", resize: "none" }}
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-section-title">Discovery Preferences</div>
                <div className="form-group">
                  <label htmlFor="pref-gender">Show Me</label>
                  <select 
                    id="pref-gender"
                    className="form-select"
                    value={userProfile.preferredGender}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, preferredGender: e.target.value }))}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="range-label-row">
                    <span>Maximum Distance</span>
                    <span>{userProfile.distanceLimit} mi</span>
                  </div>
                  <input 
                    type="range" 
                    className="range-slider"
                    min="2" 
                    max="100" 
                    value={userProfile.distanceLimit}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, distanceLimit: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <button className="btn-purchase" onClick={() => {
                setShowSettingsModal(false);
                triggerToast("Discovery settings updated.");
              }}>
                Save discovery options
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM GOLD/PLATINUM SHOPPING MODAL */}
      {showPremiumModal && (
        <div className="modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="modal-content" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setShowPremiumModal(false)}>
              <X size={18} />
            </button>
            <div style={{ padding: "30px 20px 20px" }}>
              <h2 style={{ textAlign: "center", marginBottom: "8px", fontWeight: "900", background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                UPGRADE YOUR EXPERIENCE
              </h2>
              <p style={{ textAlign: "center", fontStyle: "italic", fontSize: "13px", color: "var(--text-gray)", marginBottom: "20px" }}>
                Unlock premium powers to sync faster and deeper.
              </p>

              <div className="premium-cards-grid">
                <div 
                  className={`premium-card-tier premium-tier-gold ${userProfile.vipTier === "gold" ? "selected" : ""}`}
                  onClick={() => setUserProfile(prev => ({ ...prev, vipTier: "gold" }))}
                >
                  <div className="premium-logo-row">
                    <span className="premium-tier-name">Finder Gold</span>
                    <span className="premium-tier-badge">Popular</span>
                  </div>
                  <p>✓ Unlimited swipes & matches</p>
                  <p>✓ Unlock Undo (Rewind active cards)</p>
                  <p>✓ 1 free Profile Boost per day</p>
                  <div className="premium-price">$14.99 / month</div>
                </div>

                <div 
                  className={`premium-card-tier premium-tier-platinum ${userProfile.vipTier === "platinum" ? "selected" : ""}`}
                  onClick={() => setUserProfile(prev => ({ ...prev, vipTier: "platinum" }))}
                >
                  <div className="premium-logo-row">
                    <span className="premium-tier-name">Finder Platinum</span>
                    <span className="premium-tier-badge">Best Value</span>
                  </div>
                  <p>✓ Everything in Gold tier + VIP priority matching</p>
                  <p>✓ Message matches before swipe-matching</p>
                  <p>✓ Custom Platinum Avatar Badge</p>
                  <div className="premium-price">$24.99 / month</div>
                </div>
              </div>

              {userProfile.vipTier !== "free" ? (
                <div className="membership-status">
                  Active Subscription: {userProfile.vipTier.toUpperCase()} Mode Enabled! Thank you for backing us.
                </div>
              ) : (
                <button className="btn-purchase" onClick={() => {
                  setUserProfile(prev => ({ ...prev, vipTier: "gold" }));
                  triggerToast("Subscribed to Finder Gold! Gold perks active.");
                  setShowPremiumModal(false);
                }}>
                  Join Finder Gold
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IT'S A MATCH OVERLAY SCREEN */}
      {matchedProfile && (
        <div className="modal-overlay" style={{ zIndex: 5000 }}>
          <div className="modal-content match-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="match-modal-title">It's a Match!</div>
            <p className="match-modal-text">You and {matchedProfile.name} have liked each other.</p>

            <div className="match-photos-stage">
              <div className="match-photo-bubble">
                <img src={userProfile.avatar} alt="user avatar" />
              </div>
              <div className="match-heart-pulse">❤️</div>
              <div className="match-photo-bubble">
                <img src={matchedProfile.images[0]} alt="matched user avatar" />
              </div>
            </div>

            <div className="match-modal-input-wrap">
              <input 
                type="text" 
                className="match-message-input"
                placeholder={`Say something nice to ${matchedProfile.name}...`}
                value={matchGreeting}
                onChange={(e) => setMatchGreeting(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmMatch()}
              />
              <button className="btn-match-chat" onClick={confirmMatch}>
                Send Message & Chat
              </button>
              <button className="btn-match-keep-swiping" onClick={() => {
                // Add to matches with no message
                const newMatch = {
                  id: matchedProfile.id,
                  profile: matchedProfile,
                  lastMessage: "It's a Match! Say hi.",
                  time: "Just Now",
                  unread: true,
                  messages: []
                };
                setMatches(prev => [newMatch, ...prev]);
                setMatchedProfile(null);
                setMatchGreeting("");
                triggerToast(`Saved match with ${matchedProfile.name}!`);
              }}>
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
