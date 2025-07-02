import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TableIcon,
  LayoutGridIcon,
  FileTextIcon,
  FileDownIcon,
  Eye,
  EyeOff,
  MoreVertical,
} from "lucide-react";

import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ResponsesPage() {
  // Authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Data and UI states
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card");
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);

  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const correctPassword = "madme123";
  const exportRef = useRef(null);
  const modalRef = useRef();

  // Detect outside click for export dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Authenticate if local storage is valid
  useEffect(() => {
    const saved = localStorage.getItem("madme_authenticated");
    if (saved === "true") setAuthenticated(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedResponse(null);
      }

      // Trap tab inside modal
      if (e.key === "Tab" && selectedResponse && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedResponse]);

  const handleLogin = () => {
    if (passwordInput === correctPassword) {
      setAuthenticated(true);
      localStorage.setItem("madme_authenticated", "true");
      setError("");
    } else {
      setError("Incorrect password.");
    }
  };

  // Fetch responses
  useEffect(() => {
    if (!authenticated) return;

    const fetchResponses = async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching responses:", error);
      } else {
        setResponses(data);
      }

      setLoading(false);
    };

    fetchResponses();
  }, [authenticated]);

  // Helpers
  const filteredResponses = responses.filter(
    (res) =>
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const currentResponses = filteredResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getISTDateTimeString = () => {
    return new Date()
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(/[/:]/g, "-")
      .replace(/, /g, "_");
  };

  const formatIST = (dateStr) =>
    new Date(dateStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Export functions
  const exportCSV = () => {
    const flat = filteredResponses.map((res) => ({
      name: res.name,
      email: res.email,
      domain: res.email.split("@")[1],
      created_at: res.created_at,
      ...res.responses,
      suggestions: res.suggestions || "",
    }));

    const csv = Papa.unparse(flat);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `survey_responses_${getISTDateTimeString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Survey Responses", 14, 20);

    if (filteredResponses.length === 0) {
      doc.text("No responses found", 14, 30);
      doc.save(`survey_responses_${getISTDateTimeString()}.pdf`);
      return;
    }

    const keys = Object.keys(filteredResponses[0].responses);
    const headers = [
      "Name",
      "Email",
      "Domain",
      "Submitted At",
      ...keys.map((q) => q.replace(/([A-Z])/g, " $1")),
      "Suggestions",
    ];

    const data = filteredResponses.map((res) => [
      res.name,
      res.email,
      res.email.split("@")[1],
      formatIST(res.created_at),
      ...keys.map((k) => res.responses[k]),
      res.suggestions || "",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    doc.save(`survey_responses_${getISTDateTimeString()}.pdf`);
  };

  // View renderers
  const renderCardView = () => (
    <div className="grid gap-6 max-w-4xl mx-auto">
      {currentResponses.map((res) => (
        <Card key={res.id} className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>
              {res.name}{" "}
              <span className="text-sm text-gray-400">({res.email})</span>
            </CardTitle>
            <p className="text-sm text-gray-400">
              Domain: {res.email.split("@")[1]} | {formatIST(res.created_at)}{" "}
              IST
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {Object.entries(res.responses).map(([key, val]) => (
                <li key={key}>
                  <strong>
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    :
                  </strong>{" "}
                  {val}
                </li>
              ))}
            </ul>
            {res.suggestions && (
              <div className="mt-4">
                <strong>Suggestions:</strong>
                <p className="text-gray-300">{res.suggestions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-auto max-w-6xl mx-auto">
      <table className="min-w-[700px] bg-gray-800 text-white text-sm border border-gray-700">
        <thead className="bg-gray-700 text-xs text-gray-300">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Domain</th>
            <th className="p-3 text-left">Submitted At</th>
            {Object.keys(currentResponses[0]?.responses || {}).map((key) => (
              <th key={key} className="p-3 text-left capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </th>
            ))}
            <th className="p-3 text-left">Suggestions</th>
          </tr>
        </thead>
        <tbody>
          {currentResponses.map((res) => (
            <tr
              key={res.id}
              className="border-t border-gray-700 hover:bg-gray-700 cursor-pointer"
              onClick={() => setSelectedResponse(res)}
            >
              <td className="p-3">{res.name}</td>
              <td className="p-3">{res.email}</td>
              <td className="p-3">{res.email.split("@")[1]}</td>
              <td className="p-3">{formatIST(res.created_at)} IST</td>
              {Object.keys(res.responses).map((key) => (
                <td key={key} className="p-3">
                  {res.responses[key]}
                </td>
              ))}
              <td className="p-3">{res.suggestions || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Login screen
  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Survey Responses – MadMe Dashboard</title>
          <meta
            name="description"
            content="View, search, and export client survey responses. Analyze satisfaction, communication, and alignment metrics to improve creative services."
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
          <div className="bg-gray-800 p-6 rounded shadow max-w-sm w-full space-y-4">
            <h1 className="text-3xl font-bold text-center mb-2">
              Login to view the survey report
            </h1>
            <h2 className="text-2xl font-bold text-center">Enter Password</h2>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter MadMe password"
                className="pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleLogin} className="w-full">
              Access
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Main screen
  return (
    <>
      <Head>
        <title>Survey Responses – MadMe Dashboard</title>
        <meta
          name="description"
          content="View, search, and export client survey responses. Analyze satisfaction, communication, and alignment metrics to improve creative services."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
        <h1 className="text-center mb-8 text-2xl md:text-3xl font-bold">
          Survey Report
        </h1>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-md w-full"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded ${
                  viewMode === "card"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400"
                }`}
              >
                <LayoutGridIcon size={20} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded ${
                  viewMode === "table"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400"
                }`}
              >
                <TableIcon size={20} />
              </button>

              <div className="relative" ref={exportRef}>
                <Button
                  variant="outline"
                  onClick={() => setExportOpen(!exportOpen)}
                >
                  <MoreVertical size={18} className="mr-2" />
                  Export
                </Button>
                {exportOpen && (
                  <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow w-40 z-50">
                    <button
                      onClick={() => {
                        exportCSV();
                        setExportOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 hover:bg-gray-700"
                    >
                      <FileDownIcon size={16} className="mr-2" /> Export CSV
                    </button>
                    <button
                      onClick={() => {
                        exportPDF();
                        setExportOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 hover:bg-gray-700"
                    >
                      <FileTextIcon size={16} className="mr-2" /> Export PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View */}
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : filteredResponses.length === 0 ? (
            <p className="text-center text-gray-400">No responses found.</p>
          ) : viewMode === "card" ? (
            renderCardView()
          ) : (
            renderTableView()
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-gray-700 text-white"
                    : "text-gray-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Modal: Right Drawer */}
          {selectedResponse && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
              <div
                ref={modalRef}
                className="transform animate-slide-in w-full sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] bg-gray-900 p-6 overflow-y-auto relative focus:outline-none"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                  onClick={() => setSelectedResponse(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold mb-4">Survey Detail</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Name:</strong> {selectedResponse.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedResponse.email}
                  </p>
                  <p>
                    <strong>Domain:</strong>{" "}
                    {selectedResponse.email.split("@")[1]}
                  </p>
                  <p>
                    <strong>Submitted At:</strong>{" "}
                    {formatIST(selectedResponse.created_at)} IST
                  </p>

                  <div className="pt-4 space-y-1">
                    {Object.entries(selectedResponse.responses).map(
                      ([key, val]) => (
                        <p key={key}>
                          <strong>
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                            :
                          </strong>{" "}
                          {val}
                        </p>
                      )
                    )}
                  </div>

                  {selectedResponse.suggestions && (
                    <div className="pt-4">
                      <strong>Suggestions:</strong>
                      <p className="text-gray-300">
                        {selectedResponse.suggestions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
