import React from "react";
import useSWR from "swr"
import {Table, Tag} from "antd"
import Title from "antd/es/typography/Title";

import {formatRelative} from "date-fns"
import ru from "date-fns/locale/ru"
import {Link} from "react-router-dom";


function App() {
    const {data, error} = useSWR('/links')

    const columns = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            render: text => <Link to={"/items/" + text.id}>{text.name}</Link>,
        },
        {
            title: 'Последний парсинг',
            dataIndex: 'lastParse',
            key: 'lastParse',
        },
        {
            title: 'Статус',
            dataIndex: 'isEnabled',
            key: 'isEnabled',
            render: isEnabled => <Tag color={isEnabled ? "green" : "red"}>
                {isEnabled ? "Включен" : "Выключен"}
            </Tag>
        },
    ]

    const dataSource = data?.map(e => ({
        key: e.id,
        name: {
            name: e.name,
            id: e.id
        },
        lastParse: (() => {
            const lastParse = e.lastParse[e.lastParse.length - 1]
            return `${formatRelative(new Date(lastParse.time), new Date(), {locale: ru})}, Всего: ${lastParse.amount}, Добавлено: ${lastParse.amountAdded}`
        })(),
        isEnabled: e.isEnabled,
    })) || []


    return (
        <div>
            <Title level={3} type={"secondary"}>Ссылки для парсинга:</Title>
            <Table dataSource={dataSource} columns={columns}/>
        </div>
    );
}

export default App;
