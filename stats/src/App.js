import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Title from "antd/es/typography/Title";
import Layout, {Content} from "antd/es/layout/layout";
import Main from "./routes/Main";
import Item from "./routes/Item";

export default function App() {
    return (
        <Router>
            <Layout>
                <Content style={{padding: '50px'}}>
                    <Title level={2}>Avito-parser</Title>
                    <Switch>
                        <Route path="/items/:id">
                            <Item />
                        </Route>
                        <Route path="/">
                            <Main/>
                        </Route>
                    </Switch>
                </Content>
            </Layout>
        </Router>
    );
}
