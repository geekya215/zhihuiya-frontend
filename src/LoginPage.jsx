import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Stack, Text, FormControl, FormErrorMessage, Spinner, useToast } from '@chakra-ui/react';
import axios from 'axios';
import apiClient from './request';

const LoginPage = () => {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [errors, setErrors] = useState({
        clientId: false,
        clientSecret: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const token = localStorage.getItem("token")
        const apikey = localStorage.getItem("apikey")
        if (token !== null && apikey !== null) {
            navigate("/search")
        }
    }, []);

    const handleLogin = async () => {
        // 检查输入框是否为空
        const newErrors = {
            clientId: clientId.trim() === '',
            clientSecret: clientSecret.trim() === '',
        };
        setErrors(newErrors);

        // 如果存在错误，直接返回
        if (newErrors.clientId || newErrors.clientSecret) {
            return;
        }

        // 开始加载，显示 Spinner
        setIsLoading(true);

        // 继续处理登录...
        try {
            const response = await apiClient.post('/token', {
                client_id: clientId,
                client_secret: clientSecret
            });

            const status = response.data.status;

            // 如果成功获取token，则跳转到搜索页面，并传递token
            if (status) {
                const token = response.data.data.token;
                localStorage.setItem('token', token); // 将token存储在localStorage中
                localStorage.setItem('apikey', clientId);
                toast({
                    title: '登录成功',
                    description: '您已成功登录，正在跳转到搜索页面。',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top', // 提示条在页面顶部显示
                });
                navigate('/search'); // 登录成功后跳转到搜索页面
            } else {
                toast({
                    title: '登录失败',
                    description: response.data.error_msg,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top', // 提示条在页面顶部显示
                })
            }
        } catch (error) {
            toast({
                title: '登录失败',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top', // 提示条在页面顶部显示
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Box p={5} maxW="400px" mx="auto" mt="100px">
            <Stack spacing={3}>
                <Text fontSize="2xl" textAlign="center">
                    登录
                </Text>
                <FormControl isInvalid={errors.clientId}>
                    <Input
                        placeholder="Client ID"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                    />
                    {errors.clientId && <FormErrorMessage>Client ID 不能为空</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={errors.clientSecret}>
                    <Input
                        placeholder="Client Secret"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        type="password"
                    />
                    {errors.clientSecret && <FormErrorMessage>Client Secret 不能为空</FormErrorMessage>}
                </FormControl>
                <Button colorScheme="teal" onClick={handleLogin} disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : '登录'}
                </Button>
            </Stack>
        </Box>
    );
}

export default LoginPage;