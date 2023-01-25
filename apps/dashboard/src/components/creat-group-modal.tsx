import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    UseDisclosureProps
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { groupSizeInfo } from "../types/groups"
import useOffchainGroups from "../hooks/useOffchainGroups"
import { useSearchParams } from "react-router-dom"
import { semaphore } from "@zk-groups/onchain"
import useSigner from "../hooks/useSigner"

export default function CreatGroupModal({
    isOpen,
    onClose
}: UseDisclosureProps): JSX.Element {
    const [searchParams] = useSearchParams()
    const pageOption = searchParams.get("type")
    const [_step, setStep] = useState<number>(0)
    const [_groupName, setGroupName] = useState<string>("")
    const [_groupDescription, setGroupDescription] = useState<string>("")
    const [_groupSize, setGroupSize] = useState<string>("")
    const [_loading, setLoading] = useState<boolean>()
    const { createOffchainGroup } = useOffchainGroups()
    const _signer = useSigner()

    function nextStep() {
        setStep(_step + 1)
    }
    function previousStep() {
        setStep(_step - 1)
    }

    function submitGroupSize() {
        if (_groupSize) {
            nextStep()
        } else {
            alert("Select the group size")
        }
    }

    async function createGroup(
        groupName: string,
        groupDescription: string,
        treeDepth: number
    ) {
        if (pageOption === "on-chain") {
            setLoading(true)
            try {
                const transaction =
                    _signer &&
                    (await semaphore.createGroup(_signer, groupName, treeDepth))
                setLoading(false)
                transaction && onClose && onClose()
            } catch (error) {
                console.error(error)
            }
        } else {
            createOffchainGroup(groupName, groupDescription, treeDepth)
            onClose && onClose()
        }
    }

    function GroupSizeComponent(prop: { size: string }) {
        return (
            <Flex
                flexDir="column"
                w="280px"
                minH="250px"
                border={
                    _groupSize === prop.size
                        ? "2px solid #373A3E"
                        : "1px solid #D0D1D2"
                }
                borderRadius="4px"
                onClick={() => {
                    setGroupSize(prop.size)
                }}
                cursor="pointer"
            >
                <Box p="15px">
                    <Text fontSize="lg" fontWeight="bold">
                        {prop.size}
                    </Text>
                    <Text color="gray.500">
                        {groupSizeInfo[prop.size].sizeFor}
                    </Text>
                    <Text mt="15px">{groupSizeInfo[prop.size].capacity}</Text>
                    <Text mt="15px">Use for</Text>
                    {groupSizeInfo[prop.size].useCases.map((useCase) => {
                        return <Text key={useCase}>-{useCase}</Text>
                    })}
                </Box>
            </Flex>
        )
    }

    useEffect(() => {
        ;(async () => {
            if (!isOpen) {
                setStep(0)
                setGroupName("")
                setGroupDescription("")
                setGroupSize("")
            }
        })()
    }, [isOpen])

    return (
        <Modal isOpen={!!isOpen} onClose={onClose ? onClose : console.error}>
            <ModalOverlay />
            <ModalContent maxW={_step === 1 ? "1200px" : "600px"}>
                <ModalHeader borderBottom="1px" borderColor="gray.200">
                    {_step === 0
                        ? "Create a new group"
                        : _step === 1
                        ? "Choose a group size"
                        : "Review group details"}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {_step === 0 ? (
                        <form onSubmit={nextStep}>
                            <Flex
                                h="300px"
                                flexDir="column"
                                justifyContent="space-around"
                            >
                                <FormControl>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        value={_groupName}
                                        maxLength={31}
                                        onChange={(e) =>
                                            setGroupName(e.target.value)
                                        }
                                        isRequired
                                        placeholder="Give your group a title"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Input
                                        value={_groupDescription}
                                        minLength={10}
                                        isRequired
                                        onChange={(e) =>
                                            setGroupDescription(e.target.value)
                                        }
                                        placeholder="Enter details that will help you differentiate this group"
                                    />
                                </FormControl>
                                <Button
                                    type="submit"
                                    fontSize="lg"
                                    variant="solid"
                                    colorScheme="primary"
                                >
                                    Continue
                                </Button>
                            </Flex>
                        </form>
                    ) : _step === 1 ? (
                        <Box>
                            <Flex justifyContent="space-between">
                                <GroupSizeComponent size="small" />
                                <GroupSizeComponent size="medium" />
                                <GroupSizeComponent size="large" />
                                <GroupSizeComponent size="xl" />
                            </Flex>
                            <Text mt="20px" color="#3B3B48" textAlign="center">
                                Group size can be adjusted at any time. To learn
                                how size is calculated, visit our
                                <Link fontWeight="bold"> docs.</Link>
                            </Text>
                            <Flex justifyContent="space-between" mt="20px">
                                <Button onClick={previousStep} fontSize="lg">
                                    Back
                                </Button>
                                <Button
                                    onClick={submitGroupSize}
                                    fontSize="lg"
                                    variant="solid"
                                    colorScheme="primary"
                                >
                                    Continue
                                </Button>
                            </Flex>
                        </Box>
                    ) : (
                        <Box>
                            <Container
                                w="315px"
                                border="1px solid #D0D1D2"
                                mt="20px"
                                pb="20px"
                            >
                                <Flex flexDir="column">
                                    <Text
                                        fontSize="lg"
                                        fontWeight="bold"
                                        mt="15px"
                                    >
                                        {_groupName}
                                    </Text>
                                    <Text mt="15px" color="#75797E">
                                        {_groupSize &&
                                            groupSizeInfo[_groupSize].capacity +
                                                ", Tree depth " +
                                                groupSizeInfo[_groupSize]
                                                    .treeDepth}
                                    </Text>
                                    <Text mt="20px">{_groupDescription}</Text>
                                    <Text mt="20px">Use for</Text>
                                    {_groupSize &&
                                        groupSizeInfo[_groupSize].useCases.map(
                                            (useCase) => {
                                                return (
                                                    <Text key={useCase}>
                                                        -{useCase}
                                                    </Text>
                                                )
                                            }
                                        )}
                                </Flex>
                            </Container>
                            {_loading ? (
                                <Flex
                                    flexDir="row"
                                    justifyContent="center"
                                    marginY="20px"
                                >
                                    <Spinner size="md" />
                                    <Text ml="5">Pending transaction</Text>
                                </Flex>
                            ) : (
                                <Flex
                                    justifyContent="space-between"
                                    marginY="20px"
                                >
                                    <Button
                                        onClick={previousStep}
                                        fontSize="lg"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        fontSize="lg"
                                        variant="solid"
                                        colorScheme="primary"
                                        onClick={() => {
                                            try {
                                                createGroup(
                                                    _groupName,
                                                    _groupDescription,
                                                    groupSizeInfo[_groupSize]
                                                        .treeDepth
                                                )
                                            } catch (error) {
                                                console.error(error)
                                            }
                                        }}
                                    >
                                        Create
                                    </Button>
                                </Flex>
                            )}
                        </Box>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
