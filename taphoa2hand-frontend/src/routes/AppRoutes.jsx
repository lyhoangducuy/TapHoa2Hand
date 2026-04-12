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
import FavoritePage from '../pages/Favorite/FavoritePage';
import { PostEditPage } from '../pages/Post/Edit';
import { ChatPage } from '../pages/Chat';
import MyOrderPage from '../pages/Order/MyOrder/MyOrderPage';
import OrderDetailPage from '../pages/Order/Detail/OrderDetailPage';
import DashboardPage from '../pages/Admin/Dashboard/DashboardPage';
import AdminLayout from '../components/Layouts/AdminLayout/AdminLayout';
import UserAdminPage from '../pages/Admin/Users/UserAdminPage';
import UserEditPage from '../pages/Admin/Users/UserTable/UpdateUser/UserEditPage';
import UserCreatePage from '../pages/Admin/Users/Create/UserCreatePage';
const publicRoutes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage, layout: NoSidebarLayout },
    { path: '/register', component: RegisterPage, layout: NoSidebarLayout },
    { path: '/search', component: SearchPage },
    { path: '/post-detail/:postId', component: PostDetailPage },
];

// 2. DÀNH CHO USER ĐÃ ĐĂNG NHẬP
const privateRoutes = [
    { path: '/profile', component: ProfilePage },
    { path: '/edit-profile', component: UpdateInfoPage },
    { path: '/create-post', component: CreatePostPage, layout: NoSidebarLayout },
    { path: '/my-favorites', component: FavoritePage },
    { path: '/chat', component: ChatPage },
    { path: '/my-orders', component: MyOrderPage },
];

// 3. DÀNH RIÊNG CHO ADMIN
const adminRoutes = [
    { path: '/admin', component: DashboardPage, layout: AdminLayout },
    { path: '/admin/users', component: UserAdminPage, layout: AdminLayout },
    { path: '/admin/users/detail/:userId', component: UserEditPage, layout: AdminLayout },
    { path: '/admin/users/create', component: UserCreatePage, layout: AdminLayout }
];

export { publicRoutes, privateRoutes, adminRoutes };