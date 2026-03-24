import { HomePage } from '../pages/Home';
import { LoginPage } from '../pages/Authe';
import { SearchPage } from '../pages/Search';
import { NoSidebarLayout } from '../components/Layouts/NoSidebarLayout';
const publicRoutes = [
    {path:'/',component:HomePage},
    {path:'/login',component:LoginPage,layout: NoSidebarLayout},
    {path:'/search',component:SearchPage}
]
const privateRoutes = []
export { publicRoutes, privateRoutes }