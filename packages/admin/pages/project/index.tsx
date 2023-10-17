import { NextPage } from 'next';

import { AdminLayout } from '@/layout/AdminLayout';

import style from './index.module.scss';

const Project: NextPage = () => {
  return (
    <AdminLayout>
      <div>ProjectAdmin</div>
    </AdminLayout>
  );
};

export default Project;
