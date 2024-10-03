import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import SearchPage from './SearchPage';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          {/* 登录页路由 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 搜索页路由 */}
          <Route path="/search" element={<SearchPage />} />

          {/* 默认跳转到登录页 */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
