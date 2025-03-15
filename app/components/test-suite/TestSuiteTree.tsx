"use client";

import { useState } from "react";
import { TestSuite } from "@/lib/types/test-suite";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";

type TestSuiteWithChildren = TestSuite & {
  children: TestSuiteWithChildren[];
};

interface TestSuiteTreeProps {
  suites: TestSuiteWithChildren[];
  onSelect?: (suite: TestSuite) => void;
  selectedId?: string;
}

interface TestSuiteNodeProps {
  suite: TestSuiteWithChildren;
  level: number;
  onSelect?: (suite: TestSuite) => void;
  selectedId?: string;
}

function TestSuiteNode({
  suite,
  level,
  onSelect,
  selectedId,
}: TestSuiteNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = suite.children.length > 0;

  return (
    <div>
      <button
        className={`w-full text-left px-2 py-1.5 hover:bg-gray-100 flex items-center gap-2 ${
          selectedId === suite.id ? "bg-blue-50 text-blue-600" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onSelect?.(suite);
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )
        ) : (
          <span className="w-4" />
        )}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )
        ) : (
          <Folder className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm">{suite.name}</span>
      </button>
      {isExpanded && hasChildren && (
        <div>
          {suite.children.map((child) => (
            <TestSuiteNode
              key={child.id}
              suite={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TestSuiteTree({
  suites,
  onSelect,
  selectedId,
}: TestSuiteTreeProps) {
  return (
    <div className="border rounded-lg bg-white">
      {suites.map((suite) => (
        <TestSuiteNode
          key={suite.id}
          suite={suite}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}
