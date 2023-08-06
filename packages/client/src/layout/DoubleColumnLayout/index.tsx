import cls from 'classnames';
import React, { useEffect, useRef } from 'react';

import { CommentIcon } from '@/components/Comment/CommentIcon';
import { Likes, LikesProps } from '@/components/Likes';
import { useToggle } from '@/hooks/useToggle';
import { getDocumentScrollTop } from '@/utils';

import style from './index.module.scss';

interface IProps {
  leftNode: React.ReactNode;
  leftClassName?: null | string;
  rightNode: React.ReactNode;
  rightClassName?: null | string;
  isRightNodeMobileHidden?: boolean;
  minHeight?: string | number;
  likesProps?: LikesProps;
  showComment?: boolean;
}

/**
 * 双列布局
 * @param leftNode
 * @param leftClassName
 * @param rightNode
 * @param rightClassName
 * @param isRightNodeMobileHidden
 * @param minHeight
 * @param likesProps
 * @param showComment
 * @constructor
 */
export const DoubleColumnLayout: React.FC<IProps> = ({
  leftNode,
  leftClassName = null,
  rightNode,
  rightClassName = null,
  isRightNodeMobileHidden = true,
  minHeight = '100vh',
  likesProps,
  showComment = false,
}) => {
  const $aside = useRef<HTMLElement>();
  const [showWidge, toggleWidge] = useToggle(true);

  useEffect(() => {
    let beforeY = 0;
    let y = 0;
    const handler = () => {
      y = getDocumentScrollTop();
      toggleWidge(beforeY <= y);
      setTimeout(() => {
        beforeY = y;
      }, 0);
    };
    document.addEventListener('scroll', handler);

    return () => {
      document.removeEventListener('scroll', handler);
    };
  }, [toggleWidge]);

  /**
   * 当一个指定类型的事件（'header-state'）发生时，根据事件数据来控制某个DOM元素的position、marginTop和transform属性，从而实现该元素的固定或吸附效果。
   */
  useEffect(() => {
    const handler = (evt) => {
      const { id, isFxied, isFixedVisible, height } = evt.data;
      if (id !== 'header-state') return;
      const el = $aside.current.querySelector('.sticky') as HTMLElement;
      if (!el) return;
      el.style.position = isFxied ? 'fixed' : 'sticky';
      el.style.marginTop = isFxied ? '0' : el.dataset.marginTop + 'px';
      el.style.transform = `translateY(${isFixedVisible ? height : 0})`;
    };
    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <div className={cls(style.outerWrap)} style={{ minHeight }}>
      <div className={cls('container')}>
        <div className={style.wrap}>
          {(likesProps || showComment) && (
            <div
              className={cls(style.fixed, showWidge && style.active)}
              onClick={(e) => {
                console.log('clicked');
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
                e.stopPropagation();
              }}
            >
              {likesProps && (
                <div className={style.widgetWrapper}>
                  <Likes {...likesProps} />
                </div>
              )}
              {showComment && (
                <div className={style.widgetWrapper}>
                  <CommentIcon />
                </div>
              )}
            </div>
          )}

          <section className={cls(style.left, leftClassName)}>{leftNode}</section>
          <aside
            ref={$aside}
            className={cls(style.right, rightClassName, isRightNodeMobileHidden && style.isRightNodeMobileHidden)}
          >
            {rightNode}
          </aside>
        </div>
      </div>
    </div>
  );
};
