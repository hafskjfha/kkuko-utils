"use client";
import React from "react";
import Link from "next/link";

interface DocsLogsProps {
  id: number;
  name: string;
  Logs: {
    id: number;
    word: string;
    user: string | undefined;
    date: string;
    type: "add" | "delete";
  }[];
}

const DocsLogs = ({ id, name, Logs }: DocsLogsProps) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const convertToLocalTime = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleString(undefined, { timeZone: userTimeZone });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen">
      {/* 문서 제목 섹션 */}
      <div className="mb-4 border-b border-gray-300 pb-2">
        <Link href={`/words-docs/${id}`}>
          <h1 className="text-3xl font-bold text-gray-800">{name} - 로그</h1>
        </Link>
      </div>

      {/* 로그 테이블 */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-700 text-lg">
                <th className="p-3 text-left">단어</th>
                <th className="p-3 text-left">사용자</th>
                <th className="p-3 text-left">처리된 날짜</th>
                <th className="p-3 text-left">타입</th>
              </tr>
            </thead>
            <tbody>
              {Logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-300 text-gray-700"
                >
                  <td className="p-3">
                    {log.type === "add" ? (
                      <Link
                        href={`/word/search/${log.word}`}
                        className="text-blue-600 hover:underline"
                      >
                        {log.word}
                      </Link>
                    ) : (
                      log.word
                    )}
                  </td>
                  <td className="p-3">
                    {log.user ? (
                      <Link
                        className="cursor-pointer underline"
                        href={`/profile?username=${log.user}`}
                      >
                        {log.user}
                      </Link>
                    ) : (
                      "알수없음"
                    )}
                  </td>
                  <td className="p-3">{convertToLocalTime(log.date)}</td>
                  <td
                    className={`p-3 font-semibold ${
                      log.type === "add" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {log.type.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocsLogs;
