import React from 'react'
import { Container, Logo, LogoutBtn } from '../index'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/Logo2.png'; 


function Header() {
  const user = useSelector(state => state.auth.status)
  const navigate = useNavigate();

  const navItems = [

    { name: 'Home', slug: '/', active: true },
    { name: "Login", slug: '/login', active: !user },
    { name: "Signup", slug: '/signup', active: !user },
    { name: "All Posts", slug: '/all-posts', active: user },
    { name: "Add Post", slug: '/add-post', active: user },
  ]
  return (
    <header className='py-3 shadow' style={{ backgroundColor: '#71C9CE' }}>

      <Container>
        <nav className='flex'>
          <div className='mr-4'>
            <Link to='/'>
              <img src={logo} alt="Logo" width="130px" />
            </Link>

          </div>
          <ul className='flex ml-auto my-10'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='inline-block px-6 py-2 duration-200 hover:text-blue-700 rounded-full 
                    text-white text-2xl font-bold font-serif tracking-wide'
                  >{item.name}</button>
                </li>
              ) : null
            )}
            {user && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>

    </header>
  )
}

export default Header