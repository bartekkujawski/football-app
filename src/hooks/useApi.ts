import { localApiCall } from './localApi';

const API_BASE = import.meta.env.VITE_API_URL;

export const useApi = () => {
    const call = async <R, P = void>(
        url: string,
        method: 'GET' | 'DELETE' | 'POST' | 'PATCH',
        payload?: P
    ): Promise<R> => {
        const fetchCfg = {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: payload ? JSON.stringify(payload) : undefined,
        };

        try {
            if (!API_BASE) return await localApiCall<R, P>(url, method, payload);

            const response = await fetch(`${API_BASE}${url}`, fetchCfg);

            if (response.ok) {
                const data: R = await response.json();
                return data;
            } else {
                const apiError: string = await response.text();
                throw new Error(apiError);
            }
        } catch (e) {
            console.log('Error', e);
            throw new Error('Wystąpił bład');
        }
    };
    const apiGet = async <R>(url: string) => {
        return await call<R>(url, 'GET');
    };
    const apiDelete = async <R>(url: string) => {
        return await call<R>(url, 'DELETE');
    };
    const apiPost = async <R, P>(url: string, data: P) => {
        return await call<R, P>(url, 'POST', data);
    };
    const apiPatch = async <R, P>(url: string, data: P) => {
        return await call<R, P>(url, 'PATCH', data);
    };

    return {
        apiGet,
        apiDelete,
        apiPost,
        apiPatch,
    };
};
