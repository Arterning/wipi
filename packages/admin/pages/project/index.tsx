import {NextPage} from 'next';

import {AdminLayout} from '@/layout/AdminLayout';
import {PaginationTable} from "@components/PaginationTable";
import {usePagination} from "@/hooks/usePagination";
import {ProjectProvider} from "@/providers/project";
import {useToggle} from "@/hooks/useToggle";
import {Button, Drawer, Input, message, Popconfirm} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import React, {useCallback, useEffect, useState} from "react";
import {Upload} from "@components/Upload";
import {FileSelectDrawer} from "@components/FileSelectDrawer";
import {useAsyncLoading} from "@/hooks/useAsyncLoading";

const SEARCH_FIELDS = [
    {
        label: '名称',
        field: 'title',
        msg: '请输入项目名称',
    },
];

const columns = [
  {
    title: '项目名称',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '描述',
    dataIndex: 'desc',
    key: 'desc',
  },
  {
    title: '图片',
    dataIndex: 'cover',
    key: 'cover',
  },
  {
    title: '链接',
    dataIndex: 'href',
    key: 'href',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  }
]

/**
 * 右侧新建项目抽屉
 * @param visible
 * @param toggleVisible
 * @param project
 * @param onOk
 * @constructor
 */
function ProjectDrawer({ visible, toggleVisible, project = undefined, onOk}) {

    const isUpdate = project !== undefined;
    const [fileVisible, toggleFileVisible] = useToggle(false);
    const [createApi, createLoading] = useAsyncLoading(ProjectProvider.create);
    const [updateApi, updateLoading] = useAsyncLoading(ProjectProvider.update);

    const [title, setTitle] = useState((project && project.title) || '');
    const [summary, setSummary] = useState((project && project.desc) || '');
    const [cover, setCover] = useState((project && project.cover) || '');

    const ok = useCallback(() => {
        const data = { title: title.trim(), cover, summary: summary.trim() };
        const promise = isUpdate ? updateApi(project.id, data) : createApi(data);
        promise.then((res) => {
            message.success(isUpdate ? '更新成功' : '创建成功');
            toggleVisible();
            onOk(res);
        });
    }, [title, summary, cover, project, isUpdate, createApi, updateApi, toggleVisible, onOk]);


    /**
     * 编辑project的时候 初始化页面需要填充state
     * 这里是从state流向UI
     * onChange是从UI流向state
     */
    useEffect(() => {
        setTitle((project && project.title) || '');
        setSummary((project && project.summary) || '');
        setCover((project && project.cover) || '');
    }, [project]);

    return (
        <Drawer title={isUpdate ? '更新项目' : '新建项目'} width={600} visible={visible} onClose={toggleVisible}>
            {/* 名称 */}
            <div className="form-item">
                <label htmlFor="title">名称</label>
                <div>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
            </div>
            {/* 描述 */}
            <div className="form-item">
                <label htmlFor="summary">描述</label>
                <div>
                    <Input.TextArea
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                    />
                </div>
            </div>
            {/* 封面 */}
            <div className="form-item">
                <label htmlFor="upload">封面</label>
                <div>
                    <Upload
                        style={{
                            width: '100%',
                            minHeight: 160,
                        }}
                        onChange={setCover}
                    >
                        {cover ? <img src={cover} alt="avatar" style={{ width: '100%' }} /> : null}
                    </Upload>
                    <Input value={cover} onChange={(e) => setCover(e.target.value)} style={{ marginTop: 12 }}></Input>
                    <Button style={{ marginTop: 12 }} onClick={toggleFileVisible}>
                        选择文件
                    </Button>
                    {cover && (
                        <Button style={{ marginTop: 12, marginLeft: 12 }} danger={true} onClick={() => setCover('')}>
                            移除
                        </Button>
                    )}
                </div>
            </div>
            <FileSelectDrawer
                visible={fileVisible}
                onClose={toggleFileVisible}
                onChange={(url) => {
                    setCover(url);
                    toggleFileVisible();
                }}
            />
            <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px',
            }}>
                <Button onClick={toggleVisible}>取消</Button>
                <Button
                    style={{ marginLeft: 8 }}
                    type="primary"
                    disabled={!title.trim()}
                    loading={isUpdate ? updateLoading : createLoading}
                    onClick={ok}
                >
                    {isUpdate ? '更新' : '创建'}
                </Button>
            </div>
        </Drawer>
    );
}


/**
 * 主页面
 * @constructor
 */
const Project: NextPage = () => {
    const {
        loading: listLoading,
        data,
        refresh,
        ...resetPagination
    } = usePagination<IProject>(ProjectProvider.getProjects);
    const [visible, toggleVisible] = useToggle(false);
    const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
    const [deleteAPi, deleteLoading] = useAsyncLoading(ProjectProvider.deleteProject);

    /**
     * 创建项目
     */
    const createProject = useCallback(
        () => {
            setSelectedProject(undefined);
            toggleVisible();
        }, [toggleVisible]
    )

    /**
     * 更新项目
     */
    const editProject = useCallback(
        (item) => {
            setSelectedProject(item);
            toggleVisible();
        },
        [toggleVisible]
    );

    /**
     * 删除项目
     */
    const deleteProject = useCallback( (id) => {
        deleteAPi(id).then(() => {
            message.success('操作成功');
            refresh();
        })
    }, [deleteAPi, refresh]);

    const actionColumns = [
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    <Button onClick={() => editProject(record)}>编辑</Button>
                    <Popconfirm
                        title="确认删除这个文章？"
                        onConfirm={() => deleteProject(record.id)}
                        okText="确认"
                        cancelText="取消"
                        okButtonProps={{ loading: deleteLoading }}
                    >
                        <Button type="link" size={'small'} danger={true}>
                            删除
                        </Button>
                    </Popconfirm>
                </span>
            ),
        }
    ]
    return (
        <AdminLayout>
            <h2>项目管理</h2>
            <PaginationTable
                searchFields={SEARCH_FIELDS} refresh={refresh} showSelection={true}
                loading={listLoading}
                data={data}
                columns={[...columns, ...actionColumns]}
                {...resetPagination}
                rightNode={
                    <Button type="primary" onClick={createProject}>
                        <PlusOutlined />
                        新建
                    </Button>
                }
            />
            <ProjectDrawer visible={visible} toggleVisible={toggleVisible} onOk={refresh} project={selectedProject}/>
        </AdminLayout>
    );
};

export default Project;
