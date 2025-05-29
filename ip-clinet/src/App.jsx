import "./App.css";
import AuthLayout from "./Layout/AuthLayout";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import Favorites from "./Pages/Favorites";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./Layout/Layout";
import Detail from "./Pages/Detail";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
   return (
      <ThemeProvider>
         <BrowserRouter>
            <Routes>
               <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="favorites" element={<Favorites />} />
                  <Route path="detail/:id" element={<Detail />} />
               </Route>
               <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
               </Route>
            </Routes>
         </BrowserRouter>
      </ThemeProvider>
   );
}

export default App;
