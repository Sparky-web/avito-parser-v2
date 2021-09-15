import {createContext, useState} from "react";

const AppContext = createContext({})

const AppProvider = (props) => {
    const [activeId, setActiveId] = useState("")


    return <AppContext.Provider value={}>
        {...props.children}
    </AppContext.Provider>
}