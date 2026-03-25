import { HomePage } from '../pages/Home';
import { SearchPage } from '../pages/Search';
import { NoSidebarLayout } from '../components/Layouts/NoSidebarLayout';
import { ProfilePage } from '../pages/Profile';
import { RegisterPage } from '../pages/Authe/Register';
import { LoginPage } from '../pages/Authe/Login';
const publicRoutes = [
    {path:'/',component:HomePage},
    {path:'/login',component:LoginPage,layout: NoSidebarLayout},
    {path:'/search',component:SearchPage},
    {path:'/profile',component:ProfilePage},
    {path:'/register',component:RegisterPage,layout: NoSidebarLayout},
]
const privateRoutes = []
export { publicRoutes, privateRoutes }