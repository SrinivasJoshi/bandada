import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Link,
    Spacer,
    Text,
    Tooltip,
    useClipboard
} from "@chakra-ui/react"
import { shortenAddress } from "@zk-groups/utils"
import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAccount, useDisconnect } from "wagmi"
import { logOut as _logOut } from "../api/bandadaAPI"

export default function NavBar(): JSX.Element {
    const navigate = useNavigate()
    const location = useLocation()
    const { isConnected, address } = useAccount()
    const { hasCopied, onCopy } = useClipboard(address || "")
    const { disconnect } = useDisconnect({
        onSuccess: () => {
            navigate("/sso")
        }
    })

    const logOut = useCallback(async () => {
        await _logOut()

        navigate("/sso")
    }, [navigate])

    return (
        <Box bgColor="#F8F9FF" borderBottom="1px" borderColor="gray.200">
            <Container maxWidth="container.xl">
                <Flex h="100px">
                    <Center>
                        <Link href="/">
                            <Text fontSize="lg" fontWeight="bold">
                                ZK Groups
                            </Text>
                        </Link>
                    </Center>

                    <Spacer />

                    {location.pathname.includes("/my-groups") && (
                        <Center>
                            <Link href="/my-groups?type=off-chain">
                                <Button
                                    variant="solid"
                                    mr="10px"
                                    colorScheme="primary"
                                >
                                    My Groups
                                </Button>
                            </Link>

                            <Button variant="solid" onClick={logOut}>
                                Log out
                            </Button>
                        </Center>
                    )}

                    {isConnected && (
                        <Center>
                            <Link href="/my-groups?type=on-chain">
                                <Button
                                    variant="solid"
                                    colorScheme="primary"
                                    mr="10"
                                >
                                    My Groups
                                </Button>
                            </Link>
                            <Tooltip
                                label={hasCopied ? "Copied" : "Copy"}
                                closeOnClick={false}
                                hasArrow
                            >
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={onCopy}
                                >
                                    {address ? shortenAddress(address) : ""}
                                </Button>
                            </Tooltip>
                            <Button
                                variant="outline"
                                colorScheme="primary"
                                onClick={() => disconnect()}
                            >
                                Disconnect
                            </Button>
                        </Center>
                    )}
                </Flex>
            </Container>
        </Box>
    )
}
