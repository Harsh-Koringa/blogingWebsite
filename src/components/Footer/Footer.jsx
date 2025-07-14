import React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../index'
import { Feather, Twitter, Github, Linkedin } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' }
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety Center', href: '/safety' },
      { name: 'Community', href: '/community' }
    ],
    Legal: [
      { name: 'Cookies Policy', href: '/cookies' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' }
    ]
  }

  return (
    <footer className="bg-background border-t">
      <Container>
        <div className="grid gap-8 py-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Feather className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">BlogSpace</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Share your stories with the world. Connect, inspire, and grow together.
            </p>
            <div className="mt-4 flex gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">Social Media</span>
                </Link>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center py-6 border-t">
          <p className="text-sm text-muted-foreground">
            © {currentYear} BlogSpace. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer