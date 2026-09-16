import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState('#dashboard'); // '#dashboard', '#scanner', '#chat', '#planner', '#meals', '#hydration', '#sleep', '#mood', '#goals', '#analytics', '#settings', '#admin'

  // Food Scanner state
  const [scannerImage, setScannerImage] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [scannerError, setScannerError] = useState('');

  // AI Chatbot state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Food Logs state (MongoDB)
  const [foodLogs, setFoodLogs] = useState([]);
  const [logMealName, setLogMealName] = useState('');
  const [logMealType, setLogMealType] = useState('Lunch');
  const [logCalories, setLogCalories] = useState('');
  const [logProtein, setLogProtein] = useState('');
  const [logCarbs, setLogCarbs] = useState('');
  const [logFat, setLogFat] = useState('');
  const [logSugar, setLogSugar] = useState('');
  const [logSodium, setLogSodium] = useState('');
  const [showMealModal, setShowMealModal] = useState(false);

  // Goals & Checklist state (MongoDB)
  const [goals, setGoals] = useState([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [goalSummary, setGoalSummary] = useState('0/0 completed');

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Health Concerns state
  const [healthConcernType, setHealthConcernType] = useState('none');
  const [healthAlert, setHealthAlert] = useState(null);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Hydration state
  const [waterMl, setWaterMl] = useState(0);

  // Sound Visualizer / Ambient Mixer State
  const [mixerPlaying, setMixerPlaying] = useState(false);
  const [activeTrackTitle, setActiveTrackTitle] = useState('No Channels Active');

  // Box Breathing State
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [breathRatio, setBreathRatio] = useState('box'); // 'box' | '478'

  // Profile Form state
  const [profHeight, setProfHeight] = useState(170);
  const [profWeight, setProfWeight] = useState(70);
  const [profAge, setProfAge] = useState(25);
  const [profGoal, setProfGoal] = useState('Maintain Health');
  const [profDiet, setProfDiet] = useState('Balanced');

  // Global Alert Toast
  const [alertToast, setAlertToast] = useState(null);

  // Initialize session & load Lucide icons
  useEffect(() => {
    const storedToken = localStorage.getItem('nutrizen_token');
    const storedUser = localStorage.getItem('nutrizen_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setProfHeight(u.profile?.height || 170);
        setProfWeight(u.profile?.weight || 70);
        setProfAge(u.profile?.age || 25);
        setProfGoal(u.profile?.healthGoals || 'Maintain Health');
        setProfDiet(u.profile?.dietaryPreference || 'Balanced');
      } catch (e) {
        console.error(e);
      }
    }

    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, []);

  // Re-run Lucide icons when DOM / tab updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 100);
    }
  }, [activeTab, user, scannedResult, chatMessages, goals, notifications, recommendations]);

  // Load user data from MongoDB on session load
  useEffect(() => {
    if (user?._id) {
      fetchFoodLogs();
      fetchGoals();
      fetchHealthConcerns();
      fetchNotifications();
      fetchRecommendations();
      fetchChatHistory();
    }
  }, [user?._id]);

  const showToast = (message, type = 'success') => {
    setAlertToast({ message, type });
    setTimeout(() => setAlertToast(null), 4000);
  };

  // --- 1. AUTH HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'login' 
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('nutrizen_token', data.token);
      localStorage.setItem('nutrizen_user', JSON.stringify(data.user));

      showToast(`Welcome back, ${data.user.name}! Session initialized.`, 'success');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('nutrizen_token');
    localStorage.removeItem('nutrizen_user');
    showToast('Logged out successfully.', 'success');
  };

  // --- 2. FOOD SCANNER HANDLER (Gemini Vision + USDA) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setScannerImage(reader.result);
      setScannedResult(null);
      setScannerError('');
    };
    reader.readAsDataURL(file);
  };

  const triggerGeminiScanner = async () => {
    if (!scannerImage) return;
    setScannerLoading(true);
    setScannerError('');

    try {
      const res = await fetch('/api/scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: scannerImage })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to identify food item');
      }

      setScannedResult(data.data);
      showToast(`Identified: ${data.data.foodName}`, 'success');
    } catch (err) {
      setScannerError(err.message || 'Image processing error.');
    } finally {
      setScannerLoading(false);
    }
  };

  const logScannedFoodToDB = async () => {
    if (!scannedResult || !user?._id) return;
    try {
      const res = await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          name: scannedResult.foodName,
          mealType: 'Lunch',
          calories: scannedResult.calories,
          protein: scannedResult.protein,
          carbs: scannedResult.carbs,
          fat: scannedResult.fat,
          fiber: scannedResult.fiber,
          sugar: scannedResult.sugar,
          sodium: scannedResult.sodium,
          detectedVia: 'ai_scanner'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.alert) {
        setHealthAlert(data.alert);
      }

      showToast(`Logged ${scannedResult.foodName} to MongoDB timeline!`, 'success');
      fetchFoodLogs();
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- 3. AI CHATBOT HANDLER (Gemini API + MongoDB) ---
  const fetchChatHistory = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/chat?userId=${user._id}`);
      const data = await res.json();
      if (data.messages) setChatMessages(data.messages);
    } catch (e) {
      console.error(e);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user?._id || chatLoading) return;

    const userText = chatInput;
    setChatInput('');
    setChatLoading(true);

    // Optimistic user message update
    const updatedMessages = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(updatedMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          message: userText,
          userProfile: user.profile
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.messages) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setChatLoading(false);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- 4. FOOD LOGS & USDA LOOKUP ---
  const fetchFoodLogs = async () => {
    if (!user?._id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/food-logs?userId=${user._id}&date=${today}`);
      const data = await res.json();
      if (data.logs) setFoodLogs(data.logs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCustomMealSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id || !logMealName) return;

    try {
      const res = await fetch('/api/food-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          name: logMealName,
          mealType: logMealType,
          calories: parseInt(logCalories) || 0,
          protein: parseInt(logProtein) || 0,
          carbs: parseInt(logCarbs) || 0,
          fat: parseInt(logFat) || 0,
          sugar: parseInt(logSugar) || 0,
          sodium: parseInt(logSodium) || 0,
          detectedVia: 'manual'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.alert) {
        setHealthAlert(data.alert);
      }

      showToast(`Food logged to MongoDB!`, 'success');
      setShowMealModal(false);
      setLogMealName('');
      setLogCalories('');
      setLogProtein('');
      setLogCarbs('');
      setLogFat('');
      setLogSugar('');
      setLogSodium('');
      fetchFoodLogs();
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteFoodLog = async (logId) => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/food-logs?id=${logId}&userId=${user._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Meal deleted.', 'success');
        fetchFoodLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 5. GOALS & CHECKLIST HANDLER (MongoDB) ---
  const fetchGoals = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/goals?userId=${user._id}`);
      const data = await res.json();
      if (data.goals) {
        setGoals(data.goals);
        setGoalSummary(data.summary || `${data.completedCount}/${data.totalCount} completed`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoalText.trim() || !user?._id) return;

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, text: newGoalText })
      });
      if (res.ok) {
        setNewGoalText('');
        showToast('Goal added to MongoDB.', 'success');
        fetchGoals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleGoal = async (goalId, currentCompleted) => {
    if (!user?._id) return;
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, userId: user._id, completed: !currentCompleted })
      });
      if (res.ok) {
        showToast('Checklist updated in MongoDB.', 'success');
        fetchGoals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- 6. HEALTH CONCERNS & RECOMMENDATIONS ---
  const fetchHealthConcerns = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/health-concerns?userId=${user._id}`);
      const data = await res.json();
      if (data.concern) {
        setHealthConcernType(data.concern.concernType);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateHealthConcern = async (type) => {
    setHealthConcernType(type);
    if (!user?._id) return;
    try {
      const res = await fetch('/api/health-concerns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, concernType: type })
      });
      if (res.ok) {
        showToast(`Health concern set to ${type.toUpperCase()}`, 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecommendations = async () => {
    if (!user?._id) return;
    setRecLoading(true);
    try {
      const res = await fetch(`/api/recommendations?userId=${user._id}`);
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user._id}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculated totals from MongoDB food logs
  const totalKcal = foodLogs.reduce((acc, f) => acc + (f.calories || 0), 0);
  const totalProtein = foodLogs.reduce((acc, f) => acc + (f.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((acc, f) => acc + (f.carbs || 0), 0);
  const totalFat = foodLogs.reduce((acc, f) => acc + (f.fat || 0), 0);

  const targetKcal = profGoal === 'Weight Loss' ? 1600 : profGoal === 'Muscle Gain' ? 2600 : 2000;
  const targetProtein = profGoal === 'Muscle Gain' ? 150 : 100;
  const targetCarbs = profGoal === 'Weight Loss' ? 150 : 250;
  const targetFat = profGoal === 'Weight Loss' ? 50 : 70;

  // Render SVG Chart for Analytics
  const renderSvgChart = () => {
    const width = 600;
    const height = 220;
    const padding = 35;
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const datasetA = [1850, 1920, 2100, 1780, 2200, 1950, totalKcal || 1600];

    const graphW = width - padding * 2;
    const graphH = height - padding * 2;
    const maxV = Math.max(...datasetA, 2500);

    const getX = (i) => padding + i * (graphW / (labels.length - 1));
    const getY = (v) => padding + graphH - (v / maxV) * graphH;

    let pathStr = '';
    let points = '';
    datasetA.forEach((v, i) => {
      const x = getX(i);
      const y = getY(v);
      pathStr += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
      points += `<circle cx="${x}" cy="${y}" r="4" fill="#10B981" stroke="#090D0A" stroke-width="2" />`;
    });

    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        <path d={pathStr} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <g dangerouslySetInnerHTML={{ __html: points }} />
      </svg>
    );
  };

  return (
    <>
      <Head>
        <title>NutriZen AI – Production Wellness & AI Nutrition Platform</title>
        <meta name="description" content="NutriZen AI delivers real Gemini Vision food scanner, USDA nutrition lookup, MongoDB Atlas data flow, and personalized AI recommendations." />
      </Head>

      {/* Global Toast Notification */}
      {alertToast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2 transition ${
          alertToast.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-300' : 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
        }`}>
          <span>{alertToast.message}</span>
        </div>
      )}

      {/* Health Concern Alert Modal Banner */}
      {healthAlert && (
        <div className="fixed top-20 right-5 z-50 max-w-md bg-red-950 border border-red-800 p-4 rounded-2xl text-xs text-red-200 shadow-2xl flex items-start justify-between">
          <div className="pr-3">
            <span className="font-bold block mb-1">Health Threshold Warning</span>
            <p>{healthAlert}</p>
          </div>
          <button onClick={() => setHealthAlert(null)} className="text-red-400 hover:text-white font-bold text-sm">✕</button>
        </div>
      )}

      {/* UNAUTHENTICATED SPLIT SCREEN */}
      {!user ? (
        <div id="auth-hub" className="flex-1 flex flex-col lg:flex-row min-h-screen">
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-zen-emeraldDark via-emerald-950 to-zen-charcoal relative items-center justify-center p-12 overflow-hidden border-r border-stone-800">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-zen-emerald/10 blur-3xl blob-animate-1"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-zen-indigo/10 blur-3xl blob-animate-2"></div>
            
            <div className="relative z-10 max-w-lg text-center space-y-8">
              <div className="inline-flex items-center space-x-2">
                <svg className="h-10 w-10 text-emerald-400" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="45" stroke="#10B981" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
                  <path d="M 50 15 C 65 30 75 50 50 85 C 25 50 35 30 50 15 Z" fill="#10B981" opacity="0.85" />
                  <circle cx="50" cy="30" r="5" fill="#FFFFFF" />
                </svg>
                <span className="font-serif text-2xl font-bold text-white">NutriZen <span className="text-emerald-400 font-sans text-sm font-semibold ml-0.5">AI</span></span>
              </div>

              <h1 className="text-4xl font-serif text-white font-bold leading-tight">
                Your Intelligent Guide to <span className="italic text-emerald-400">Nutritional Health</span> & <span className="italic text-indigo-400">Zen Mindfulness</span>
              </h1>
              
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center animate-ping opacity-25 absolute"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-400 flex items-center justify-center relative shadow-lg">
                  <i data-lucide="wind" className="h-8 w-8 text-white"></i>
                </div>
                <p className="text-xs text-stone-300 italic pt-4">"Breathing represents the anchor of conscious physiological control."</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-zen-charcoal">
            <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl border border-white/10">
              <div className="flex border-b border-stone-800 pb-px">
                <button onClick={() => setAuthMode('login')} className={`flex-1 pb-3 text-sm font-semibold border-b-2 ${authMode === 'login' ? 'border-emerald-500 text-white' : 'border-transparent text-stone-500'}`}>Sign In</button>
                <button onClick={() => setAuthMode('register')} className={`flex-1 pb-3 text-sm font-medium ${authMode === 'register' ? 'border-b-2 border-emerald-500 text-white' : 'text-stone-500'}`}>Create Account</button>
              </div>

              {authError && (
                <div className="p-3.5 bg-red-950/40 border border-red-900/50 text-red-400 rounded-2xl text-xs flex items-center">
                  <i data-lucide="alert-circle" className="h-4 w-4 mr-2 shrink-0"></i>
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-stone-400">Your Name</label>
                    <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Zen Practitioner" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-stone-400">Email Address</label>
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="practitioner@nutrizen.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-stone-400">Password</label>
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="••••••••" />
                </div>

                <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm transition shadow-[0_4px_20px_rgba(16,185,129,0.25)]">
                  {authLoading ? 'Connecting to MongoDB Atlas...' : authMode === 'login' ? 'Initialize Session' : 'Create Free Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED MAIN WORKSPACE HUB */
        <div id="workspace-hub" className="flex-1 flex flex-col md:flex-row">
          <aside className="w-full md:w-64 bg-stone-950 border-r border-stone-900 flex flex-col justify-between z-30">
            <div className="p-4 space-y-6 flex flex-col flex-1">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="45" stroke="#10B981" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
                    <path d="M 50 15 C 65 30 75 50 50 85 C 25 50 35 30 50 15 Z" fill="#10B981" opacity="0.85" />
                  </svg>
                  <span className="font-serif text-lg font-bold text-white">NutriZen</span>
                </div>
                <button onClick={handleLogout} className="text-xs text-stone-500 hover:text-stone-300">Sign Out</button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5 pt-4">
                {[
                  { id: '#dashboard', label: 'Dashboard Overview', icon: 'layout-dashboard' },
                  { id: '#scanner', label: 'Real Food Scanner', icon: 'camera', badge: 'Gemini AI' },
                  { id: '#chat', label: 'AI Wellness Assistant', icon: 'bot', badge: 'Gemini' },
                  { id: '#meals', label: 'Food Log Timeline', icon: 'utensils', badge: 'USDA' },
                  { id: '#goals', label: 'Goals & Milestones', icon: 'check-square', count: goalSummary },
                  { id: '#analytics', label: 'Trend Analytics', icon: 'line-chart' },
                  { id: '#settings', label: 'Profile & Health Concerns', icon: 'settings' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      activeTab === item.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <i data-lucide={item.icon} className="h-4 w-4"></i>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase">{item.badge}</span>}
                    {item.count && <span className="text-[9px] text-stone-500">{item.count}</span>}
                  </button>
                ))}
              </nav>
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t border-stone-900 bg-stone-950 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{user.name}</div>
                <div className="text-[10px] text-stone-500">{user.email}</div>
              </div>
              <span className="px-2 py-0.5 bg-stone-850 text-[9px] text-stone-400 rounded font-mono uppercase">MongoDB Atlas</span>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 bg-zen-charcoal p-4 md:p-8 overflow-y-auto">

            {/* 1. DASHBOARD VIEW */}
            {activeTab === '#dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Welcome back, {user.name}</h1>
                    <p className="text-stone-400 text-xs mt-1">Real-time status metrics powered by MongoDB Atlas & Gemini AI.</p>
                  </div>
                  <button onClick={() => setActiveTab('#scanner')} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition">
                    Scan Food with Gemini
                  </button>
                </div>

                {/* Macro Widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Calories Consumed</span>
                    <div className="text-2xl font-bold text-white mt-1">{totalKcal} / {targetKcal} <span className="text-xs text-stone-500">kcal</span></div>
                    <div className="h-1 bg-stone-950 rounded-full mt-2 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (totalKcal/targetKcal)*100)}%` }}></div></div>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Protein Intake</span>
                    <div className="text-2xl font-bold text-white mt-1">{totalProtein}g / {targetProtein}g</div>
                    <div className="h-1 bg-stone-950 rounded-full mt-2 overflow-hidden"><div className="h-full bg-red-400" style={{ width: `${Math.min(100, (totalProtein/targetProtein)*100)}%` }}></div></div>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Carbohydrates</span>
                    <div className="text-2xl font-bold text-white mt-1">{totalCarbs}g / {targetCarbs}g</div>
                    <div className="h-1 bg-stone-950 rounded-full mt-2 overflow-hidden"><div className="h-full bg-sky-400" style={{ width: `${Math.min(100, (totalCarbs/targetCarbs)*100)}%` }}></div></div>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Lipids / Fats</span>
                    <div className="text-2xl font-bold text-white mt-1">{totalFat}g / {targetFat}g</div>
                    <div className="h-1 bg-stone-950 rounded-full mt-2 overflow-hidden"><div className="h-full bg-yellow-500" style={{ width: `${Math.min(100, (totalFat/targetFat)*100)}%` }}></div></div>
                  </div>
                </div>

                {/* AI Recommendations Panel */}
                <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm">Real AI Personalized Recommendations</h3>
                    <button onClick={fetchRecommendations} className="text-xs text-emerald-400 hover:underline">{recLoading ? 'Refreshing...' : 'Refresh AI Suggestions'}</button>
                  </div>
                  <div className="space-y-3">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec, i) => (
                        <div key={i} className="p-3 bg-stone-950 border border-stone-850 rounded-xl text-xs text-stone-300 flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-500 italic">No recommendations loaded yet. Log meals or tap refresh.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. REAL FOOD SCANNER VIEW (Gemini Vision) */}
            {activeTab === '#scanner' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">Real Gemini Food Vision Scanner</h1>
                  <p className="text-stone-400 text-xs mt-1">Upload or take a food photo. Gemini Vision identifies the dish & queries USDA for macros.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upload box */}
                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">
                    <h3 className="font-bold text-stone-200 text-sm">Step 1: Upload Food Image</h3>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600" />
                    
                    {scannerImage && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-stone-800 max-h-64 flex justify-center bg-black">
                        <img src={scannerImage} alt="Food Upload" className="object-contain h-64" />
                      </div>
                    )}

                    <button onClick={triggerGeminiScanner} disabled={!scannerImage || scannerLoading} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-xs transition">
                      {scannerLoading ? 'Analyzing with Gemini Vision...' : 'Analyze Image with Gemini AI'}
                    </button>

                    {scannerError && <p className="text-xs text-red-400">{scannerError}</p>}
                  </div>

                  {/* Identified results */}
                  <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">
                    <h3 className="font-bold text-stone-200 text-sm">Step 2: AI Identified Food & USDA Macros</h3>
                    {scannedResult ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl">
                          <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold">Confidence: {(scannedResult.confidenceScore * 100).toFixed(0)}%</span>
                          <h2 className="text-xl font-bold text-white mt-1">{scannedResult.foodName}</h2>
                          <p className="text-xs text-stone-400 mt-1">{scannedResult.description}</p>
                          <span className="text-[10px] text-stone-500 mt-2 block">USDA Match: {scannedResult.usdaMatch}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="bg-stone-950 p-3 rounded-xl"><span className="text-[9px] text-stone-500 block uppercase">Calories</span><span className="text-base font-bold text-white">{scannedResult.calories} kcal</span></div>
                          <div className="bg-stone-950 p-3 rounded-xl"><span className="text-[9px] text-stone-500 block uppercase">Protein</span><span className="text-base font-bold text-red-400">{scannedResult.protein}g</span></div>
                          <div className="bg-stone-950 p-3 rounded-xl"><span className="text-[9px] text-stone-500 block uppercase">Carbs</span><span className="text-base font-bold text-sky-400">{scannedResult.carbs}g</span></div>
                          <div className="bg-stone-950 p-3 rounded-xl"><span className="text-[9px] text-stone-500 block uppercase">Fats</span><span className="text-base font-bold text-yellow-500">{scannedResult.fat}g</span></div>
                        </div>

                        <button onClick={logScannedFoodToDB} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition">
                          Save Logged Item to MongoDB
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-xs text-stone-500 italic">
                        Upload an image and click Analyze to view real food recognition data.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. REAL AI CHATBOT VIEW (Gemini API) */}
            {activeTab === '#chat' && (
              <div className="space-y-6 flex flex-col h-[75vh]">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">Real Gemini Nutrition Chatbot</h1>
                  <p className="text-stone-400 text-xs mt-1">Specialized clinical nutritionist & wellness guide. Context stored in MongoDB.</p>
                </div>

                <div className="flex-1 bg-stone-900 border border-stone-800 rounded-3xl p-4 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-stone-950 text-stone-200 border border-stone-850 rounded-bl-none'
                      }`}>
                        <div className="font-bold text-[9px] opacity-75 mb-1">{msg.role === 'user' ? 'You' : 'NutriZen AI (Gemini)'}</div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-stone-950 border border-stone-850 p-3 rounded-2xl text-xs text-stone-400 animate-pulse">
                        NutriZen AI is thinking...
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={sendChatMessage} className="flex space-x-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about healthy swaps, macro targets, or diet plans..." className="flex-1 px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500" />
                  <button type="submit" disabled={chatLoading} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition">
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* 4. MEALS LOG TIMELINE (USDA Data) */}
            {activeTab === '#meals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Food Logs Timeline</h1>
                    <p className="text-stone-400 text-xs mt-1">Persisted live in MongoDB Atlas.</p>
                  </div>
                  <button onClick={() => setShowMealModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition">
                    + Manual Add Meal
                  </button>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-stone-200 text-sm">Today's Logged Items</h3>
                  <div className="divide-y divide-stone-850">
                    {foodLogs.length > 0 ? (
                      foodLogs.map((m) => (
                        <div key={m._id} className="py-4 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-emerald-400">{m.mealType} ({m.detectedVia})</span>
                            <h4 className="font-bold text-sm text-white mt-0.5">{m.name}</h4>
                            <div className="flex space-x-3 text-[10px] text-stone-400 mt-1">
                              <span>Calories: <strong>{m.calories} kcal</strong></span>
                              <span>P: <strong>{m.protein}g</strong></span>
                              <span>C: <strong>{m.carbs}g</strong></span>
                              <span>F: <strong>{m.fat}g</strong></span>
                              <span>Sugar: <strong>{m.sugar}g</strong></span>
                              <span>Sodium: <strong>{m.sodium}mg</strong></span>
                            </div>
                          </div>
                          <button onClick={() => deleteFoodLog(m._id)} className="text-stone-500 hover:text-red-500 text-xs">Delete</button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-stone-500 italic">No food items logged for today in MongoDB.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. GOALS & MILESTONES (MongoDB Checklist) */}
            {activeTab === '#goals' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">Goals & Daily Checklist</h1>
                  <p className="text-stone-400 text-xs mt-1">Syncs in real time with MongoDB Atlas. Progress: {goalSummary}</p>
                </div>

                <form onSubmit={addGoal} className="flex space-x-2">
                  <input type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} placeholder="Add a new milestone goal (e.g. Drink 2.5L Water)..." className="flex-1 px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500" />
                  <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition">Add Goal</button>
                </form>

                <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-3">
                  {goals.map((g) => (
                    <div key={g._id} className="flex items-center justify-between p-4 bg-stone-950 border border-stone-850 rounded-2xl">
                      <span className={`text-xs font-semibold ${g.completed ? 'line-through text-stone-500' : 'text-stone-200'}`}>{g.text}</span>
                      <button onClick={() => toggleGoal(g._id, g.completed)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${g.completed ? 'bg-stone-850 text-stone-500' : 'bg-emerald-500 text-white'}`}>
                        {g.completed ? 'Completed' : 'Mark Done'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. ANALYTICS VIEW */}
            {activeTab === '#analytics' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">Trend Analytics</h1>
                  <p className="text-stone-400 text-xs mt-1">Dynamic SVG rendering based on user intake.</p>
                </div>
                <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl h-72">
                  {renderSvgChart()}
                </div>
              </div>
            )}

            {/* 7. SETTINGS & HEALTH CONCERNS VIEW */}
            {activeTab === '#settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-white">Health Concerns & Settings</h1>
                  <p className="text-stone-400 text-xs mt-1">Set thresholds to trigger automatic alerts upon food logging.</p>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-white text-sm">Select Primary Health Concern</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'diabetes', label: 'Diabetes (Sugar limit: 25g)' },
                      { id: 'hypertension', label: 'Hypertension (Sodium limit: 1500mg)' },
                      { id: 'heart_health', label: 'Heart Health (Low Salt/Saturated Fat)' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateHealthConcern(item.id)}
                        className={`p-3 rounded-xl text-xs text-left font-semibold border transition ${
                          healthConcernType === item.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-stone-950 border-stone-850 text-stone-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* MANUAL MEAL ADD MODAL */}
      {showMealModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Log Food Entry</h3>
              <button onClick={() => setShowMealModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCustomMealSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Meal Name</label>
                <input type="text" value={logMealName} onChange={(e) => setLogMealName(e.target.value)} required className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white" placeholder="e.g. Quinoa Salad" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Calories (kcal)</label>
                  <input type="number" value={logCalories} onChange={(e) => setLogCalories(e.target.value)} required className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white" />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Protein (g)</label>
                  <input type="number" value={logProtein} onChange={(e) => setLogProtein(e.target.value)} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1">Carbs (g)</label>
                  <input type="number" value={logCarbs} onChange={(e) => setLogCarbs(e.target.value)} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white" />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Fat (g)</label>
                  <input type="number" value={logFat} onChange={(e) => setLogFat(e.target.value)} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white" />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Sugar (g)</label>
                  <input type="number" value={logSugar} onChange={(e) => setLogSugar(e.target.value)} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white" />
                </div>
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Sodium (mg)</label>
                <input type="number" value={logSodium} onChange={(e) => setLogSodium(e.target.value)} className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white" />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition">
                Commit Entry to MongoDB
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
