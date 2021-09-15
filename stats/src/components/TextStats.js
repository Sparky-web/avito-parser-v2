import React from 'react';
import Text from "antd/es/typography/Text";

const getAverage = (arr) => Math.round(arr.reduce((acc, val) => acc + val, 0) / arr.length)

function TextStats(props) {
    const {all, sold} = props
    return (
        <Text>
            <br />
            Выставлено всего: {all.length}
            <br />
            Продано всего: {sold.length}
            <br />
            Средняя цена выставления: {getAverage(all.map(e=>e.price))} ₽
            <br />
            Средняя цена продажи: {getAverage(sold.map(e=>e.price))} ₽
            <br />
        </Text>
    );
}

export default TextStats;
