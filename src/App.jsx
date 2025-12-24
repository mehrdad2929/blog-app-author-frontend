import {
    RouterProvider,
    createBrowserRouter,
} from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import NewPost from "./pages/NewPost";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
const router = createBrowserRouter([
    {
        path: "/signup",
        Component: Signup,
    },
    {
        path: "/login",
        Component: Login,
    },
    {
        path: "/profile",
        element: (
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
        ),
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
    },
    {
        path: "/posts/new",
        element: (
            <ProtectedRoute>
                <NewPost />
            </ProtectedRoute>
        ),
    },
    {
        path: "/posts/:id",
        element: (
            <ProtectedRoute>
                <PostDetail />
            </ProtectedRoute>
        ),
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
