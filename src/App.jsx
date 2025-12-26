import { RouterProvider, createBrowserRouter, redirect } from 'react-router';
import Login, { loader as loginLoader, action as loginAction } from './pages/Login';
import Signup, { loader as signupLoader, action as signupAction } from './pages/Signup';
import Home, { loader as homeLoader, action as homeAction } from './pages/Home';
import Profile, { loader as profileLoader, action as profileAction } from './pages/Profile';
import NewPost, { loader as newPostLoader, action as newPostAction } from './pages/NewPost';
import PostDetail, { loader as postDetailLoader, action as postDetailAction } from './pages/PostDetail';

const router = createBrowserRouter([
  {
    path: '/signup',
    Component: Signup,
    loader: signupLoader,
    action: signupAction
  },
  {
    path: '/login',
    Component: Login,
    loader: loginLoader,
    action: loginAction
  },
  {
    path: '/logout',
    loader: () => {
      localStorage.removeItem('token');
      return redirect('/login');
    }
  },
  {
    path: '/',
    Component: Home,
    loader: homeLoader,
    action: homeAction
  },
  {
    path: '/profile',
    Component: Profile,
    loader: profileLoader,
    action: profileAction
  },
  {
    path: '/posts/new',
    Component: NewPost,
    loader: newPostLoader,
    action: newPostAction
  },
  {
    path: '/posts/:id',
    Component: PostDetail,
    loader: postDetailLoader,
    action: postDetailAction
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;