import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, History, Heart, User, LogIn, UserPlus, PenTool, FlaskConical } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

function navIconClass(active: boolean) {
  return `p-2 rounded-lg transition-colors ${
    active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`;
}

export function Layout() {
  const { isAuthenticated } = useContext(AuthContext);
  const { pathname } = useLocation();

  const isHome = pathname === '/';
  const isProblemInput = pathname === '/problem-input';
  const isExperimentHome = pathname === '/experiment';
  const isProblemRecords = pathname === '/problem-records';
  const isMyFavorites = pathname === '/my-favorites';
  const isMyPage = pathname === '/mypage';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 固定在顶部 */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {isExperimentHome ? (
                <>
                  <Link
                    to="/"
                    className="hidden sm:inline text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0"
                  >
                    MWPSolver-KS
                  </Link>
                  <span className="hidden sm:inline text-gray-300 shrink-0">|</span>
                  <span className="text-lg font-semibold text-gray-800 whitespace-nowrap truncate">
                    数学解题认知实验平台
                  </span>
                </>
              ) : (
                <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  MWPSolver-KS
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/" className={navIconClass(isHome)} title="首页">
                <Home size={20} />
              </Link>
              <Link to="/problem-input" className={navIconClass(isProblemInput)} title="解题">
                <PenTool size={20} />
              </Link>
              <Link to="/experiment" className={navIconClass(isExperimentHome)} title="实验平台">
                <FlaskConical size={20} />
              </Link>
              <Link to="/problem-records" className={navIconClass(isProblemRecords)} title="解题记录">
                <History size={20} />
              </Link>
              <Link to="/my-favorites" className={navIconClass(isMyFavorites)} title="我的收藏">
                <Heart size={20} />
              </Link>
              {isAuthenticated ? (
                <Link to="/mypage" className={navIconClass(isMyPage)} title="我的">
                  <User size={20} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm">
                    <LogIn size={18} />
                    <span className="hidden sm:inline">登录</span>
                  </Link>
                  <Link to="/register" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm">
                    <UserPlus size={18} />
                    <span className="hidden sm:inline">注册</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域：固定高度 = 视口减去顶栏，内部由各页面自行滚动 */}
      <main className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-1rem)]">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}