import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

import {
    Trophy,
    Settings,
    UserPlus,
    PlusCircle,
    Search,
    AlertTriangle,
    Trash2,
    Activity,
    CheckCircle2,
    XCircle,
    User,
} from 'lucide-react';

const Leaderboard = () => {

    const [topCandidates, setTopCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [createUserId, setCreateUserId] = useState('');
    const [createUserName, setCreateUserName] = useState('');
    const [createUserPoints, setCreateUserPoints] = useState('0');

    const [addPointsUserId, setAddPointsUserId] = useState('');
    const [addPointsValue, setAddPointsValue] = useState('10');

    const [searchUserId, setSearchUserId] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const [operationMessage, setOperationMessage] = useState({
        text: '',
        isError: false,
    });

    
    const fetchLeaderboard = async () => {
        try {
            const req = await fetch(`${API_BASE_URL}/leaderBoard`);
            const res = await req.json();

            if (res.success) {
                setTopCandidates(res.topCandidates);
            }
        } catch (error) {
            console.error('Error fetching leaderboard', error);
        } finally {
            setLoading(false);
        }
    };

    // Polling
    useEffect(() => {
        fetchLeaderboard();

        const interval = setInterval(fetchLeaderboard, 3000);

        return () => clearInterval(interval);
    }, []);


    const showStatus = (text, isError = false) => {
        setOperationMessage({ text, isError });

        setTimeout(() => {
            setOperationMessage({ text: '', isError: false });
        }, 4000);
    };


    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!createUserId || !createUserName) {
            return showStatus('Please fill out all fields', true);
        }

        try {
            const req = await fetch(`${API_BASE_URL}/update-rank`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: createUserId,
                    userName: createUserName,
                    points: parseInt(createUserPoints) || 0,
                }),
            });

            const res = await req.json();

            if (res.success) {
                showStatus(`Successfully initialized user "${createUserName}"!`);

                setCreateUserId('');
                setCreateUserName('');
                setCreateUserPoints('0');

                fetchLeaderboard();
            }
        } catch (error) {
            showStatus('Failed to create user', true);
        }
    };


    const handleAddPoints = async (e) => {
        e.preventDefault();

        if (!addPointsUserId || !addPointsValue) {
            return showStatus('Please enter User ID and Points', true);
        }

        try {
            const req = await fetch(`${API_BASE_URL}/update-rank`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: addPointsUserId,
                    userName: '',
                    points: parseInt(addPointsValue),
                }),
            });

            const res = await req.json();

            if (res.success) {
                showStatus(
                    `Added ${addPointsValue} points. New total score: ${res.pos}`
                );

                setAddPointsUserId('');

                fetchLeaderboard();
            }
        } catch (error) {
            showStatus('Failed to update points', true);
        }
    };

    const handleGetRank = async (e) => {
        e.preventDefault();

        if (!searchUserId) return;

        try {
            const req = await fetch(
                `${API_BASE_URL}/leaderBoard/${searchUserId}/rank`
            );

            const res = await req.json();

            if (res.success) {
                setSearchResult({
                    success: true,
                    rank: res.rank,
                    userId: searchUserId,
                });
            } else {
                setSearchResult({
                    success: false,
                    message: res.message,
                });
            }
        } catch (error) {
            showStatus('Failed to query rank details', true);
        }
    };

    // Clear Storage
    const handleClearStorage = async () => {
        const confirmed = window.confirm(
            'Are you completely sure you want to delete all leaderboard records? This cannot be undone.'
        );

        if (!confirmed) return;

        try {
            const req = await fetch(`${API_BASE_URL}/clear-storage`);
            const res = await req.json();

            showStatus(res.message);

            setSearchResult(null);

            fetchLeaderboard();
        } catch (error) {
            showStatus('Failed to clear database storage', true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-200 pb-4 gap-4">

                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            <Settings className="w-8 h-8 text-blue-600" />
                            System Admin Dashboard
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Real-time Redis backend synchronization console
                        </p>
                    </div>

                    <span className="text-xs font-semibold bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-green-500" />
                        Live Connection
                    </span>
                </header>

                {/* Status */}
                {operationMessage.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg border text-sm font-medium flex items-start gap-2 ${operationMessage.isError
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                    >
                        {operationMessage.isError ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        )}

                        <span>{operationMessage.text}</span>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* LEFT COLUMN */}
                    <section className="md:col-span-5 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                        <div className="bg-gray-900 text-white p-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />

                            <h2 className="text-lg font-bold tracking-wide">
                                Current Top 10 Candidates
                            </h2>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400">
                                Loading rankings...
                            </div>
                        ) : (
                            <div className="p-4">

                                {topCandidates.length === 0 ? (
                                    <div className="text-center text-gray-400 py-10">
                                        No candidates ranked yet.
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {topCandidates.map((candidate, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 border border-gray-100 p-3 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-center gap-3">

                                                    <span className="w-6 text-center font-extrabold text-sm text-gray-400">
                                                        #{index + 1}
                                                    </span>

                                                    <div>
                                                        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-gray-400" />

                                                            {candidate.userName || 'Anonymous'}
                                                        </span>

                                                        <span className="text-xs font-mono text-gray-400">
                                                            ID:{' '}
                                                            {candidate.userId?.replace('user:', '')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="font-bold text-blue-600">
                                                    {candidate.points} pts
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </section>

                    {/* RIGHT COLUMN */}
                    <section className="md:col-span-7 space-y-6">

                        {/* Create User */}
                        <form
                            onSubmit={handleCreateUser}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
                        >
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                                Create / Initialize User
                            </h3>

                            <input
                                type="text"
                                placeholder="User ID"
                                value={createUserId}
                                onChange={(e) => setCreateUserId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />

                            <input
                                type="text"
                                placeholder="User Name"
                                value={createUserName}
                                onChange={(e) => setCreateUserName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />

                            <input
                                type="number"
                                placeholder="Starting Points"
                                value={createUserPoints}
                                onChange={(e) => setCreateUserPoints(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                            >
                                Create Profile
                            </button>
                        </form>

                        {/* Add Points */}
                        <form
                            onSubmit={handleAddPoints}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
                        >
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-green-600" />
                                Add Points to User
                            </h3>

                            <input
                                type="text"
                                placeholder="Target User ID"
                                value={addPointsUserId}
                                onChange={(e) => setAddPointsUserId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />

                            <input
                                type="number"
                                placeholder="Points Increment"
                                value={addPointsValue}
                                onChange={(e) => setAddPointsValue(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />

                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                            >
                                Apply Score Modification
                            </button>
                        </form>

                        {/* Search Rank */}
                        <form
                            onSubmit={handleGetRank}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
                        >
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Search className="w-5 h-5 text-amber-600" />
                                Lookup Specific Rank
                            </h3>

                            <input
                                type="text"
                                placeholder="Enter User ID"
                                value={searchUserId}
                                onChange={(e) => setSearchUserId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />

                            <button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium"
                            >
                                Check Rank
                            </button>

                            {searchResult && (
                                <div
                                    className={`p-4 rounded-lg border text-sm ${searchResult.success
                                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                                            : 'bg-gray-100 border-gray-200 text-gray-600'
                                        }`}
                                >
                                    {searchResult.success ? (
                                        <p>
                                            User ID: <strong>{searchResult.userId}</strong> is
                                            currently ranked #
                                            <strong>{searchResult.rank}</strong> globally.
                                        </p>
                                    ) : (
                                        <p>{searchResult.message}</p>
                                    )}
                                </div>
                            )}
                        </form>

                        {/* Danger Zone */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">

                            <h3 className="font-bold text-lg text-red-700 flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5" />
                                Clear Leaderboard Storage
                            </h3>

                            <p className="text-sm text-red-600 mb-4">
                                Clearing storage flushes all hashes and keys completely from
                                the running Redis memory instance.
                            </p>

                            <button
                                onClick={handleClearStorage}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Flush & Clear Storage
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;