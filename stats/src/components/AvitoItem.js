import React from 'react';
import {List} from "antd";
import Avatar from "antd/es/avatar/avatar";
import {formatDistance, formatRelative} from "date-fns";
import ru from "date-fns/locale/ru";

function AvitoItems({items}) {
    return (
        <List
            style={{backgroundColor: "#FFFFFF"}}
            itemLayout="vertical"
            size="large"
            pagination={{
                onChange: page => {
                    console.log(page);
                },
                pageSize: 10,
            }}
            dataSource={items.sort((a, b) => new Date(b.dateSold) - new Date(a.dateSold))}
            renderItem={item => (
                <List.Item
                    key={item.title}
                    actions={[]}
                    extra={
                        <img
                            width={272}
                            alt="logo"
                            src={item.photoUrls.split(",")[0]}
                        />
                    }
                >
                    <List.Item.Meta
                        title={<a href={item.url} target="_blank">{item.title}</a>}
                        description={item.price + " ₽"}
                    />
                    <b>Выставлено: {formatRelative(new Date(item.datePublished), new Date(), {locale: ru})}</b>
                    <br/>
                    {item.isSold ? <>
                        <b>Продано: {formatRelative(new Date(item.dateSold), new Date(), {locale: ru})}</b>
                        <br/>
                        <b>Продано за {formatDistance(new Date(item.datePublished), new Date(item.dateSold), {locale: ru})}</b>
                        <br/>
                    </> : ""}

                    <br/>
                    {item.description}
                </List.Item>
            )}
        />
    );
}

export default AvitoItems;