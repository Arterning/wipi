import React from 'react';
import { animated, useTrail } from 'react-spring';

interface ListTrailProps {
  length: number;
  options: Record<string, unknown>;
  element?: string;
  setItemContainerProps?: (index: number) => Record<string, unknown>;
  renderItem: (index: number) => React.ReactNode;
}

/**
 *
 * @param length
 * @param options 传入动画的from和to
 * @param element
 * @param setItemContainerProps
 * @param renderItem
 * @constructor
 */
export const ListTrail: React.FC<ListTrailProps> = ({
  length,
  options,
  element = 'li',
  setItemContainerProps = () => ({}),
  renderItem,
}) => {
  //使用animated来对element进行包装，从而获得一个动画版本的组件类型。这是为了使 useTrail 钩子能够对列表项应用动画效果。
  const C = animated[element];

  //config配置动画属性
  const trail = useTrail(length, {
    config: { mass: 2, tension: 280, friction: 24, clamp: true },
    ...options,
  });

  return (
    <>
      {trail.map((style, index) => {
        return (
          <C key={index} style={style} {...setItemContainerProps(index)}>
            {renderItem(index)}
          </C>
        );
      })}
    </>
  );
};
