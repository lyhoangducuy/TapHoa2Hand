import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import classNames from 'classnames/bind';
import styles from './Breadcrumb.module.scss';

const cx = classNames.bind(styles);

function Breadcrumb({ category, postTitle }) {
    return (
        <nav className={cx('breadcrumb')}>
            <Link to="/" className={cx('item')}>
                <FiHome /> Trang chủ
            </Link>

            {/* Nếu có danh mục thì hiện đốt thứ 2 */}
            {category && (
                <>
                    <FiChevronRight className={cx('separator')} />
                    <Link to={`/category/${category.id}`} className={cx('item')}>
                        {category.name}
                    </Link>
                </>
            )}

            {/* Đốt cuối cùng: Tên bài viết (không cho click) */}
            {postTitle && (
                <>
                    <FiChevronRight className={cx('separator')} />
                    <span className={cx('item', 'active')}>
                        {postTitle}
                    </span>
                </>
            )}
        </nav>
    );
}

export default Breadcrumb;