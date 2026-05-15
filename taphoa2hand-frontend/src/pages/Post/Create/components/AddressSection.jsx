import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';
import { getProvinces, getWardsByProvince } from '../../../../services/locationService';

const cx = classNames.bind(styles);

/**
 * @param {object} postAddress — city/ward/street (tên hiển thị gửi API), provinceCode/wardCode (UI)
 * @param {object} fieldErrors
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onAddressChange — cho ô street
 * @param {(patch: object) => void} onPostAddressPatch — cập nhật một phần postAddress
 * @param {boolean} [embedded] — true: không render fieldset/legend (dùng trong card Edit)
 */
function AddressSection({
    postAddress,
    fieldErrors = {},
    onAddressChange,
    onPostAddressPatch,
    embedded = false,
}) {
    const [provinces, setProvinces] = useState([]);
    const [provincesLoading, setProvincesLoading] = useState(true);
    const [provincesError, setProvincesError] = useState(null);

    const [wards, setWards] = useState([]);
    const [wardsLoading, setWardsLoading] = useState(false);
    const [wardsError, setWardsError] = useState(null);

    const loadProvinces = useCallback(async () => {
        setProvincesLoading(true);
        setProvincesError(null);
        try {
            const res = await getProvinces();
            if (res?.code === 1000 && Array.isArray(res.result)) {
                setProvinces(res.result);
            } else {
                setProvinces([]);
                setProvincesError(res?.message || 'Không tải được danh sách tỉnh/thành');
            }
        } catch (err) {
            setProvinces([]);
            setProvincesError(err?.message || 'Lỗi kết nối');
        } finally {
            setProvincesLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProvinces();
    }, [loadProvinces]);

    const provinceCode = postAddress.provinceCode || '';

    useEffect(() => {
        if (!provinceCode) {
            setWards([]);
            setWardsError(null);
            setWardsLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setWardsLoading(true);
            setWardsError(null);
            try {
                const res = await getWardsByProvince(provinceCode);
                if (cancelled) return;
                if (res?.code === 1000 && Array.isArray(res.result)) {
                    setWards(res.result);
                    if (res.result.length === 0) {
                        setWardsError('Không có phường/xã cho tỉnh đã chọn.');
                    }
                } else {
                    setWards([]);
                    setWardsError(res?.message || 'Không tải được phường/xã');
                }
            } catch (err) {
                if (!cancelled) {
                    setWards([]);
                    setWardsError(err?.message || 'Lỗi tải phường/xã');
                }
            } finally {
                if (!cancelled) setWardsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [provinceCode]);

    // Gán lại mã tỉnh khi mở bài sửa (chỉ có tên city từ API)
    useEffect(() => {
        if (!provinces.length || postAddress.provinceCode) return;
        const c = (postAddress.city || '').trim();
        if (!c) return;
        const exact = provinces.find((p) => p.name.trim() === c);
        const hit =
            exact ||
            provinces.find(
                (p) =>
                    p.name.toLowerCase().includes(c.toLowerCase()) ||
                    c.toLowerCase().includes(p.name.toLowerCase())
            );
        if (hit) {
            onPostAddressPatch({ provinceCode: String(hit.code), city: hit.name });
        }
    }, [provinces, postAddress.city, postAddress.provinceCode, onPostAddressPatch]);

    // Gán lại mã phường khi đã có danh sách wards (bài sửa chỉ có tên ward)
    useEffect(() => {
        if (!wards.length || postAddress.wardCode) return;
        const w = (postAddress.ward || '').trim();
        if (!w) return;
        const exact = wards.find((x) => x.name.trim() === w);
        const hit =
            exact ||
            wards.find(
                (x) =>
                    x.name.toLowerCase().includes(w.toLowerCase()) ||
                    w.toLowerCase().includes(x.name.toLowerCase())
            );
        if (hit) {
            onPostAddressPatch({ wardCode: String(hit.code), ward: hit.name });
        }
    }, [wards, postAddress.ward, postAddress.wardCode, onPostAddressPatch]);

    const inner = (
        <>
            <div className={cx('grid2Cols')}>
                <div className={cx('formGroup')}>
                    <label>Tỉnh / Thành phố</label>
                    {provincesError && (
                        <p className={cx('errorText')}>
                            {provincesError}{' '}
                            <button type="button" className={cx('submitBtn')} style={{ marginLeft: 8, padding: '4px 12px', fontSize: 13 }} onClick={loadProvinces}>
                                Thử lại
                            </button>
                        </p>
                    )}
                    <select
                        className={cx('inputControl', { error: fieldErrors.city })}
                        value={provinceCode}
                        disabled={provincesLoading || provinces.length === 0}
                        onChange={(e) => {
                            const code = e.target.value;
                            const item = provinces.find((p) => String(p.code) === code);
                            onPostAddressPatch({
                                provinceCode: code,
                                city: item?.name ?? '',
                                wardCode: '',
                                ward: '',
                            });
                        }}
                    >
                        <option value="">
                            {provincesLoading ? 'Đang tải…' : '— Chọn tỉnh/thành —'}
                        </option>
                        {provinces.map((p) => (
                            <option key={p.code} value={String(p.code)}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    {fieldErrors.city && <span className={cx('errorText')}>{fieldErrors.city}</span>}
                </div>
                <div className={cx('formGroup')}>
                    <label>Phường / Xã</label>
                    {wardsError && provinceCode && <span className={cx('errorText')}>{wardsError}</span>}
                    <select
                        className={cx('inputControl', { error: fieldErrors.ward })}
                        value={postAddress.wardCode || ''}
                        disabled={!provinceCode || wardsLoading || wards.length === 0}
                        onChange={(e) => {
                            const wcode = e.target.value;
                            const item = wards.find((w) => String(w.code) === wcode);
                            onPostAddressPatch({
                                wardCode: wcode,
                                ward: item?.name ?? '',
                            });
                        }}
                    >
                        <option value="">
                            {!provinceCode
                                ? 'Chọn tỉnh trước'
                                : wardsLoading
                                  ? 'Đang tải…'
                                  : wards.length === 0
                                    ? 'Không có dữ liệu'
                                    : '— Chọn phường/xã —'}
                        </option>
                        {wards.map((w) => (
                            <option key={`${w.code}-${w.name}`} value={String(w.code)}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                    {fieldErrors.ward && <span className={cx('errorText')}>{fieldErrors.ward}</span>}
                </div>
            </div>
            <div className={cx('formGroup')}>
                <label>Số nhà / Tên đường</label>
                <input
                    className={cx('inputControl', { error: fieldErrors.street })}
                    name="street"
                    value={postAddress.street}
                    onChange={onAddressChange}
                    placeholder="Ví dụ: 12 Nguyễn Huệ"
                />
                {fieldErrors.street && <span className={cx('errorText')}>{fieldErrors.street}</span>}
            </div>
        </>
    );

    if (embedded) {
        return <div className={cx('fieldset')}>{inner}</div>;
    }

    return (
        <fieldset className={cx('fieldset')}>
            <legend className={cx('legend')}>Địa chỉ người bán</legend>
            {inner}
        </fieldset>
    );
}

export default AddressSection;
