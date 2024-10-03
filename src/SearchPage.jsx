import React, { useState, useEffect } from 'react';
import {
    Box, Input, Button, Center, Card, CardBody, CardHeader, Heading, HStack, Select, Flex,
    VStack, InputGroup, InputLeftElement, TableContainer,
    Table, Thead, Tbody, Th, Tr, Td, Text, Spinner, useToast
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // 默认每页显示10条数据
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const apikey = localStorage.getItem("apikey");
        if (token === null || apikey === null) {
            navigate("/login");
        }
        triggerSearch();
    }, [currentPage, itemsPerPage]);

    // 更新搜索框内容
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // 按下回车键时触发搜索
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (currentPage === 1) {
                triggerSearch();
            } else {
                setCurrentPage(1);
            }
        }
    }

    const handleButtonClick = () => {
        if (currentPage === 1) {
            triggerSearch();
        } else {
            setCurrentPage(1);
        }
    }

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(1); // 改变每页显示条数时重置到第一页
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    // 分页逻辑，生成页码
    const pagination = () => {
        const pageNumbers = [];

        if (totalPages <= 5) {
            // 如果总页数小于等于5，显示所有页码
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // 显示前两页
            pageNumbers.push(1);
            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            // 显示当前页以及前后页码
            const startPage = Math.max(currentPage - 1, 2);
            const endPage = Math.min(currentPage + 1, totalPages - 1);

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            // 显示最后一页
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    // 触发搜索
    const triggerSearch = async () => {
        try {
            setIsLoading(true);
            const patentsResponse = await axios.post('http://127.0.0.1:8080/api/v1/search/patents', {
                query_text: searchTerm,  // 请求体参数
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage
            }, {
                params: {  // 查询参数
                    apikey: localStorage.getItem("apikey"),
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            const patentsStatus = patentsResponse.data.status;

            if (patentsStatus) {
                const patentsData = patentsResponse.data.data;
                const totalResultCount = patentsData.total_search_result_count;
                setTotalResults(totalResultCount);
                setTotalPages(Math.ceil(totalResultCount / itemsPerPage));
                const patents = patentsData.results;
                const patentIds = patents.map(p => p.patent_id).join(',')

                const bibliographyRepsonse = await axios.post('http://127.0.0.1:8080/api/v1/search/bibliography', {}, {
                    params: {  // 查询参数
                        apikey: localStorage.getItem("apikey"),
                        patent_id: patentIds
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });

                const bibliographyStatus = bibliographyRepsonse.data.status
                if (bibliographyStatus) {
                    const bibliographyData = bibliographyRepsonse.data.data;
                    setResults(bibliographyData);
                } else {
                    toast({
                        title: '查询失败',
                        description: patentsResponse.data.error_msg,
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'bottom', // 提示条在页面顶部显示
                    });

                    if (bibliographyRepsonse.data.error_code === 67200003) {
                        localStorage.removeItem("apikey");
                        localStorage.removeItem("token");
                        navigate("/login");
                    }
                }
            } else {
                toast({
                    title: '查询失败',
                    description: patentsResponse.data.error_msg,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'bottom', // 提示条在页面顶部显示
                });

                if (patentsResponse.data.error_code === 67200003) {
                    localStorage.removeItem("apikey");
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
        } catch (error) {
            toast({
                title: '查询失败',
                description: error,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top', // 提示条在页面顶部显示
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box width="1400px" mx="auto" mt="5">
            <VStack spacing={3} align="stretch">
                <Center>
                    <Text fontSize='5xl'>智慧芽专利搜索</Text>
                </Center>
                <Card>
                    <CardBody>
                        <HStack spacing={2} mb={3}>
                            {/* 搜索栏 */}
                            <InputGroup>
                                <InputLeftElement>
                                    <SearchIcon />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                    size="md"
                                />
                            </InputGroup>
                            {/* 搜索按钮 */}
                            <Button colorScheme="teal" onClick={handleButtonClick}>
                                Search
                            </Button>
                        </HStack>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <Heading size="md">
                            共找到{totalResults}条结果
                        </Heading>
                    </CardHeader>
                    <CardBody>
                        {isLoading ? (
                            <Center>
                                <Spinner size="xl" color="teal.500" />
                            </Center>
                        ) :
                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>序号</Th>
                                            <Th>专利号</Th>
                                            <Th>标题</Th>
                                            <Th>申请人</Th>
                                            <Th>发明人</Th>
                                            <Th>申请日期</Th>
                                            <Th>公开日期</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {results.map((item, index) => {
                                            const title = item.bibliographic_data.invention_title[0].text;
                                            const applicant = item.bibliographic_data.parties.applicants.map(n => n.name).join(',');
                                            const inventor = item.bibliographic_data.parties.inventors.map(i => i.name).join(',');
                                            const applicationDate = item.bibliographic_data.application_reference.date;
                                            const publicationDate = item.bibliographic_data.publication_reference.date;

                                            return (
                                                <Tr key={item.patent_id}>
                                                    <Td>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
                                                    <Td>{item.patent_id}</Td>
                                                    <Td>{title}</Td>
                                                    <Td>{applicant}</Td>
                                                    <Td>{inventor}</Td>
                                                    <Td>{applicationDate}</Td>
                                                    <Td>{publicationDate}</Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        }

                        {/* Flex 布局，将 Select 放在左边，分页放在右边 */}
                        <Flex justifyContent="space-between" alignItems="center" mt={4}>
                            <Select width="150px" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                <option value={10}>10 items/page</option>
                                <option value={15}>15 items/page</option>
                                <option value={20}>20 items/page</option>
                            </Select>
                            {/* 分页按钮 */}
                            <HStack spacing={2}>
                                {totalResults !== 0 &&
                                    <Button
                                        onClick={goToPreviousPage}
                                        isDisabled={currentPage === 1}
                                        colorScheme="teal"
                                    >
                                        Previous
                                    </Button>
                                }

                                {/* 动态生成的页码 */}
                                {pagination().map((page, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => typeof page === 'number' && handlePageClick(page)}
                                        isDisabled={page === currentPage}
                                        colorScheme={page === currentPage ? 'blue' : 'gray'}
                                    >
                                        {page}
                                    </Button>
                                ))}

                                {totalResults !== 0 &&
                                    <Button
                                        onClick={goToNextPage}
                                        isDisabled={currentPage === totalPages}
                                        colorScheme="teal"
                                    >
                                        Next
                                    </Button>
                                }
                            </HStack>
                        </Flex>
                    </CardBody>
                </Card>
            </VStack>
        </Box >
    );
}

export default SearchPage;