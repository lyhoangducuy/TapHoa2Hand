import { HomePage } from '../pages/Home';
import { LoginPage } from '../pages/Authe';
import { SearchPage } from '../pages/Search';
const publicRoutes = [
    {path:'/',component:HomePage},
    {path:'/login',component:LoginPage,layout:null},
    {path:'/search',component:SearchPage}
]
const privateRoutes = []
export { publicRoutes, privateRoutes }