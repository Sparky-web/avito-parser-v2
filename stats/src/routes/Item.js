import React, {useState} from 'react';
import {useParams} from "react-router-dom";
import useSWR from "swr"
import Title from "antd/es/typography/Title";
import { DatePicker, Space } from 'antd';
import Text from "antd/es/typography/Text";
import moment from 'moment';
import TextStats from "../components/TextStats";
import ChartStats from "../components/ChartStats";

const { RangePicker } = DatePicker;

const getAverage = (arr) => Math.round(arr.reduce((acc, val) => acc + val, 0) / arr.length)

function Item(props) {
    const [range, setRange] = useState([moment().subtract(1, "month"), moment()])

    const {id} = useParams()
    const {data} = useSWR(`/items?&link=${id}&datePublished_gt=${range?.[0]?.toISOString()}&datePublished_lt=${range?.[1]?.toISOString()}&_limit=-1`)
    const {data: link} = useSWR("/links/" + id)


    if(!data || !link) return <div>Loading...</div>

    const sold = data.filter(e=>e.isSold)


    return (
        <div>
            <Title level={2}>{link.name}</Title>

            <RangePicker defaultValue={range} onChange={e => {
                if(e?.[0] && e?.[1]) setRange(e)
            }}/>

            <TextStats all={data} sold={sold} />

            <br/>

            <div style={{width: "100%", height: "300px"}}>

            <ChartStats all={data} sold={sold} link={link} range={range}/>
            </div>
        </div>

    );
}

export default Item;