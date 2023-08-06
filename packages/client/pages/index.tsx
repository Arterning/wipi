import { ArticleCarousel } from '@components/ArticleCarousel';
import { ArticleList } from '@components/ArticleList';
import { Footer } from '@components/Footer';
import { Tags } from '@components/Tags';
import { Menu } from 'antd';
import cls from 'classnames';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { ArticleRecommend } from '@/components/ArticleRecommend';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers/article';

import style from './index.module.scss';
interface IHomeProps {
  articles: IArticle[];
  total: number;
  recommendedArticles: IArticle[];
}
const pageSize = 12;
export const CategoryMenu = ({ categories }) => {
  const t = useTranslations();
  const router = useRouter();
  const { asPath } = router;
  return (
    //水平首页菜单
    <Menu mode="horizontal">
      {[
        {
          label: t('all'),
          path: '/',
        },
        ...categories,
      ].map((category, index) => (
        <Menu.Item
          key={index}
          className={cls({
            ['ant-menu-item-selected']:
              index === 0 ? asPath === category.path : asPath.replace('/category/', '') === category.value,
          })}
        >
          <Link
            {...(index === 0
              ? { href: '/' }
              : {
                  href: '/category/[category]',
                  as: `/category/` + category.value,
                })}
            shallow={false}
          >
            <a aria-label={category.label}>
              <span>{category.label}</span>
            </a>
          </Link>
        </Menu.Item>
      ))}
    </Menu>
  );
};
const Home: NextPage<IHomeProps> = ({ articles: defaultArticles = [], recommendedArticles = [], total = 0 }) => {
  const t = useTranslations();
  const { setting, tags, categories } = useContext(GlobalContext);
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<IArticle[]>(defaultArticles);
  useEffect(() => {
    setArticles(defaultArticles);
  }, [defaultArticles]);
  const getArticles = useCallback((page) => {
    ArticleProvider.getArticles({
      page,
      pageSize,
      status: 'publish',
    }).then((res) => {
      setPage(page);
      setArticles((articles) => [...articles, ...res[0]]);
    });
  }, []);
  return (
    <div className={style.wrapper}>
      <DoubleColumnLayout
        leftNode={
          <>
            {recommendedArticles && recommendedArticles.length ? (
              <div className={style.crouselWrap}>
                <ArticleCarousel articles={recommendedArticles} />
              </div>
            ) : null}
            <div className={style.leftWrap}>
              <header>
                <CategoryMenu categories={categories} />
              </header>
              <main>
                <InfiniteScroll
                  pageStart={1}
                  loadMore={getArticles}
                  hasMore={page * pageSize < total}
                  loader={
                    <div className={'loading'} key={0}>
                      {t('gettingArticle')}
                    </div>
                  }
                >
                  <ArticleList articles={articles} />
                </InfiniteScroll>
              </main>
            </div>
          </>
        }
        rightNode={
          <div className="sticky">
            <ArticleRecommend mode="inline" />
            <Tags tags={tags} />
            <Footer className={style.footer} setting={setting} />
          </div>
        }
      />
    </div>
  );
};
// 服务端预取数据
Home.getInitialProps = async () => {
  // Promise.all 接受一个包含多个Promise的数组作为输入，并返回一个新的Promise。
  // 这个新的Promise会在所有输入的Promise都解决（即全部完成）后进行解决，或者在其中一个Promise被拒绝（失败）时进行拒绝。
  // 如果所有的Promise都成功解决，Promise.all 的返回值将是一个包含所有Promise结果的数组。
  const [articles, recommendedArticles] = await Promise.all([
    ArticleProvider.getArticles({ page: 1, pageSize, status: 'publish' }),
    ArticleProvider.getAllRecommendArticles().catch(() => []),
  ]);
  return {
    articles: articles[0],
    total: articles[1],
    recommendedArticles,
    needLayoutFooter: false,
  };
};
export default Home;
