import { HomePage } from '../pages/Home';
import { SearchPage } from '../pages/Search';
import { NoSidebarLayout } from '../components/Layouts/NoSidebarLayout';
import { ProfilePage } from '../pages/Profile';
import { RegisterPage } from '../pages/Authe/Register';
import { LoginPage } from '../pages/Authe/Login';
import CodePage from '../pages/Authe/Register/Code/CodePage';
import { UpdateInfoPage } from '../pages/Profile/UpdateInfo';
import { PostDetailPage } from '../pages/Post/Detail';
import { CreatePostPage } from '../pages/Post/Create';
const publicRoutes = [
    {path:'/',component:HomePage},
    {path:'/login',component:LoginPage,layout: NoSidebarLayout},
    {path:'/search',component:SearchPage},
    {path:'/profile',component:ProfilePage},
    {path:'/register',component:RegisterPage,layout: NoSidebarLayout},
    {path:'send-code',component:CodePage,layout: NoSidebarLayout},
    {path:'/edit-profile',component:UpdateInfoPage},
    {path:'/post-detail/:postId',component:PostDetailPage},
    {path:'/create-post',component:CreatePostPage, layout: NoSidebarLayout},
]
const privateRoutes = []
export { publicRoutes, privateRoutes }