import { HomePage } from '../pages/Home';
import { LoginPage } from '../pages/Authe';
import { SearchPage } from '../pages/Search';
import { NoSidebarLayout } from '../components/Layouts/NoSidebarLayout';
import { ProfilePage } from '../pages/Profile';
const publicRoutes = [
    {path:'/',component:HomePage},
    {path:'/login',component:LoginPage,layout: NoSidebarLayout},
    {path:'/search',component:SearchPage},
    {path:'/profile',component:ProfilePage}
]
const privateRoutes = []
export { publicRoutes, privateRoutes }