import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  IconButton,
  useDisclosure,
} from "@chakra-ui/core"
import React, { useContext } from "react"
import { FiMenu } from "react-icons/fi"
import MyThemeContext from "../../themeContext"
import Footer from "./Footer"
import IconNavBar from "./IconNavBar"
import TopNav from "./TopNav"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkerBgColor, bgColor, textColor } = useContext(MyThemeContext)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <TopNav />
      <IconNavBar />
      <Box color={textColor} bg={bgColor} minH="100vh">
        <Container maxWidth="80ch">{children}</Container>
        <Footer />
      </Box>

      <IconButton
        aria-label="Open menu"
        onClick={onOpen}
        icon={<FiMenu />}
        position="fixed"
        bottom={0}
        right={0}
        isRound
        m={4}
        size="lg"
        display={["flex", null, "none"]}
      >
        Open
      </IconButton>
      <Drawer onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent bg={darkerBgColor}>
          <DrawerCloseButton />
          <DrawerBody>
            {/*navIcons.map(({ name, displayName }) => (
              <Link key={name} to={name}>
                <Flex alignItems="center" my={4} onClick={onClose}>
                  <Image
                    src={`/images/navIcons/${name}.webp`}
                    fallbackSrc={`/images/navIcons/${name}.png`}
                    h={12}
                    w={12}
                    mx={4}
                    alt={name}
                    cursor="pointer"
                  />
                  <Heading size="md">{displayName}</Heading>
                </Flex>
              </Link>
            ))*/}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Layout