
// src/components/common/abstract-icons.tsx
import React from 'react';
import { cn } from "@/lib/utils";

export const IconCreateTunnel = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="hsl(var(--secondary))" d="m18.083 22.188l13.792-6.875M18.083 27.792l13.792 6.895z"/>
            <path stroke="hsl(var(--primary))" d="M12.5 18.75a6.25 6.25 0 1 1 0 12.5a6.25 6.25 0 0 1 0-12.5M31.25 37.5a6.25 6.25 0 1 0 12.5 0a6.25 6.25 0 0 0-12.5 0m6.25-18.75a6.25 6.25 0 1 0 0-12.5a6.25 6.25 0 0 0 0 12.5"/>
        </g>
    </svg>
);

export const IconCombinedTunnel = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#285184" d="m43.23 17.354l-1.876-2.083a2.08 2.08 0 0 0-1.541-.688H29.167v8.334h10.645a2.08 2.08 0 0 0 1.542-.688l1.875-2.083a2.083 2.083 0 0 0 0-2.792M6.77 24.313l1.876 2.083a2.08 2.08 0 0 0 1.541.687h10.646V18.75H10.188a2.08 2.08 0 0 0-1.542.688L6.77 21.52a2.083 2.083 0 0 0 0 2.791"/>
            <path stroke="#13f7ec" d="M16.667 43.75h16.666m-4.166 0h-8.334V8.333a2.083 2.083 0 0 1 2.084-2.083h4.166a2.083 2.083 0 0 1 2.084 2.083z"/>
        </g>
    </svg>
);


export const IconNetmaker = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#73bdf2" d="M39.583 43.75v-25a6.25 6.25 0 1 0-12.5 0V37.5a6.25 6.25 0 1 1-12.5 0V6.25"/>
            <path stroke="#24fbff" d="M18.75 10.417L14.583 6.25l-4.166 4.167"/>
        </g>
    </svg>
);

export const IconSettings = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path stroke="#36224a" d="M25 31.25a6.25 6.25 0 1 0 0-12.5a6.25 6.25 0 0 0 0 12.5"/>
        <path stroke="#d517b6" d="M41.667 20.833h-1.23a2.08 2.08 0 0 1-1.958-1.395a2.08 2.08 0 0 1 .417-2.375l.854-.855a2.08 2.08 0 0 0 0-2.958l-2.958-2.98a2.084 2.084 0 0 0-2.959 0l-.854.855a2.08 2.08 0 0 1-2.375.417a2.08 2.08 0 0 1-1.437-1.98V8.334a2.083 2.083 0 0 0-2.084-2.083h-4.166a2.083 2.083 0 0 0-2.084 2.083v1.23a2.08 2.08 0 0 1-1.395 1.958v0a2.08 2.08 0 0 1-2.375-.417l-.855-.854a2.08 2.08 0 0 0-2.958 0l-2.98 2.958a2.084 2.084 0 0 0 0 2.959l.855.854a2.08 2.08 0 0 1 .417 2.375a2.08 2.08 0 0 1-1.959 1.396h-1.25a2.083 2.083 0 0 0-2.083 2.083v4.167a2.083 2.083 0 0 0 2.083 2.083h1.23a2.08 2.08 0 0 1 1.958 1.396v0a2.08 2.08 0 0 1-.417 2.375l-.854.854a2.083 2.083 0 0 0 0 2.958l2.938 2.938a2.084 2.084 0 0 0 2.958 0l.854-.854a2.08 2.08 0 0 1 2.375-.417a2.08 2.08 0 0 1 1.396 1.958v1.334a2.083 2.083 0 0 0 2.083 2.083h4.167a2.083 2.083 0 0 0 2.083-2.083v-1.23A2.08 2.08 0 0 1 30.5 38.48a2.08 2.08 0 0 1 2.375.417l.854.854a2.08 2.08 0 0 0 2.959 0l2.937-2.937a2.08 2.08 0 0 0 0-2.959L38.771 33a2.08 2.08 0 0 1-.417-2.375v0a2.08 2.08 0 0 1 1.959-1.396h1.354a2.083 2.083 0 0 0 2.083-2.083v-4.23a2.083 2.083 0 0 0-2.083-2.083"/>
    </g>
  </svg>
);

export const IconViewKey = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#5b6b75" d="M25 29.167a4.167 4.167 0 1 0 0-8.334a4.167 4.167 0 0 0 0 8.334"/>
            <path stroke="#36ecd8" d="M43.75 25S37.5 37.5 25 37.5S6.25 25 6.25 25S12.5 12.5 25 12.5S43.75 25 43.75 25"/>
        </g>
    </svg>
);

export const IconClipboard = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#dd1165" d="M37.5 6.25h-25c-1.15 0-2.083.933-2.083 2.083v33.334c0 1.15.932 2.083 2.083 2.083h25c1.15 0 2.083-.933 2.083-2.083V8.333c0-1.15-.932-2.083-2.083-2.083"/>
            <path stroke="#424a4f" d="m18.75 29.167l4.167 4.166L31.25 25m-12.5-12.5a2.083 2.083 0 0 0 2.083 2.083h8.334A2.083 2.083 0 0 0 31.25 12.5V6.25h-12.5z"/>
        </g>
    </svg>
);

export const IconActiveTunnel = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#88238c" d="M25 6.25V25"/>
            <path stroke="#11ddcd" d="M36.792 15.292a16.667 16.667 0 1 1-23.584 0"/>
        </g>
    </svg>
);

export const IconLogs = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#b4d70f" d="M35.417 25v10.417zm-8.334 10.417V31.25zM6.25 31.25l5.896-5.896zm10.417-16.667a6.25 6.25 0 1 0 0 12.5a6.25 6.25 0 0 0 0-12.5"/>
            <path stroke="#11bedd" d="M16.667 6.25h25a2.083 2.083 0 0 1 2.083 2.083v33.334a2.083 2.083 0 0 1-2.083 2.083h-25a2.083 2.083 0 0 1-2.084-2.083v-6.25"/>
        </g>
    </svg>
);

export const IconAddServer = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" stroke="#36ecd2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M25 10.417v29.166M10.417 25h29.166z"/>
    </svg>
);

export const IconDelete = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#f2175b" d="M25 22.917v12.5m8.333-20.834v-6.25A2.083 2.083 0 0 0 31.25 6.25h-12.5a2.083 2.083 0 0 0-2.083 2.083v6.25z"/>
            <path stroke="#ec6436" d="M8.333 14.583h33.334zm27.23 27.23l1.937-27.23h-25l1.938 27.23a2.083 2.083 0 0 0 2.083 1.937h16.958a2.084 2.084 0 0 0 2.084-1.938"/>
        </g>
    </svg>
);

export const IconExport = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#17adf2" d="M18.75 12.5L25 6.25l6.25 6.25M25 6.25v29.167"/>
            <path stroke="#36ecad" d="M41.667 35.417v6.25a2.083 2.083 0 0 1-2.084 2.083H10.417a2.083 2.083 0 0 1-2.084-2.083v-6.25"/>
        </g>
    </svg>
);

export const IconImport = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#17adf2" d="M31.25 29.167L25 35.417l-6.25-6.25m6.25 6.25V6.25"/>
            <path stroke="#36ecad" d="M8.333 35.417v6.25a2.083 2.083 0 0 0 2.084 2.083h29.166a2.083 2.083 0 0 0 2.084-2.083v-6.25"/>
        </g>
    </svg>
);

export const IconPing = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#f217c7" strokeWidth="3" d="M24.896 25h.208"/>
            <path stroke="#5aec36" strokeWidth="2" d="M11.75 38.25a18.75 18.75 0 0 1 0-26.5m5.875 5.875a10.417 10.417 0 0 0 0 14.75M38.25 38.25a18.75 18.75 0 0 0 0-26.5m-5.875 20.625a10.415 10.415 0 0 0 0-14.75"/>
        </g>
    </svg>
);

export const IconSave = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6 text-blue-400", className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="60" height="60" rx="6" stroke="currentColor" strokeWidth="5"/>
        <path d="M35 50 L48 65 L70 35" stroke="currentColor" strokeWidth="5" fill="none"/>
    </svg>
);

export const IconEditServer = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#ccf217" d="M42.52 13.354L36.647 7.48a2.083 2.083 0 0 0-2.959 0l-6 6l8.834 8.834l6-6a2.084 2.084 0 0 0 0-2.959"/>
            <path stroke="#36ecae" d="m21.813 19.354l8.833 8.834L15.083 43.75H6.25v-8.833z"/>
        </g>
    </svg>
);

export const IconCleanup = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#ec4c36" d="M29.167 37.5H18.75a12.5 12.5 0 0 1-7.208-22.687m9.291-2.313H31.25a12.5 12.5 0 0 1 7.208 22.688"/>
            <path stroke="#f2d717" d="m25 33.333l4.167 4.167L25 41.667m0-25L20.833 12.5L25 8.333"/>
        </g>
    </svg>
);

export const IconSwap = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 30 L80 30 L70 20" stroke="currentColor" strokeWidth="5" fill="none"/>
        <path d="M80 70 L20 70 L30 80" stroke="currentColor" strokeWidth="5" fill="none"/>
    </svg>
);

export const IconCheck = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 50 L40 70 L80 30" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconEyeOff = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="6" opacity="0.3"/>
    <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.3"/>
    <path d="M10 50 Q50 0, 90 50 Q50 100, 10 50 Z" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.1"/>
    <line x1="20" y1="80" x2="80" y2="20" stroke="currentColor" strokeWidth="5"/>
  </svg>
);

export const IconBrain = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#171cf2" d="M12.5 33.333H8.333M25 12.5V6.25zm8.333 0V8.333zm-16.666 0V8.333zM37.5 25h6.25zm0 8.333h4.167zm0-16.666h4.167zM25 37.5v6.25zm-8.333 0v4.167zm16.666 0v4.167zM12.5 25H6.25zm0-8.333H8.333z"/>
            <path stroke="#36beec" d="M35.417 37.5H14.583a2.083 2.083 0 0 1-2.083-2.083V14.583a2.083 2.083 0 0 1 2.083-2.083h20.834a2.083 2.083 0 0 1 2.083 2.083v20.834a2.083 2.083 0 0 1-2.083 2.083m-6.25-16.667h-8.334v8.334h8.334z"/>
        </g>
    </svg>
);

export const IconSaveChanges = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#1e2f44" d="m27.542 34.375l16.208-18.75"/>
            <path stroke="#0286bb" d="m6.25 24.75l8.333 9.625l16.209-18.75"/>
        </g>
    </svg>
);

export const IconArrowUp = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#bb0272" d="M25 43.75V6.25"/>
            <path stroke="#4a2142" d="M31.25 12.5L25 6.25l-6.25 6.25"/>
        </g>
    </svg>
);

export const IconArrowDown = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#02bba6" d="M25 6.25v37.5"/>
            <path stroke="#3c5153" d="M18.75 37.5L25 43.75l6.25-6.25"/>
        </g>
    </svg>
);

export const IconSun = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#a2f00a" d="m11.75 11.75l1.458 1.458M25 6.25v2.083zm13.25 5.5l-1.458 1.458zM43.75 25h-2.083zm-5.5 13.25l-1.458-1.458zM25 43.75v-2.083zm-13.25-5.5l1.458-1.458zM6.25 25h2.083z"/>
            <path stroke="#bbdf6a" d="M25 33.333a8.333 8.333 0 1 0 0-16.666a8.333 8.333 0 0 0 0 16.666"/>
        </g>
    </svg>
);

export const IconMoon = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
             <path stroke="#000" d="m11.75 11.75l1.458 1.458M25 6.25v2.083zm13.25 5.5l-1.458 1.458zM43.75 25h-2.083zm-5.5 13.25l-1.458-1.458zM25 43.75v-2.083zm-13.25-5.5l1.458-1.458zM6.25 25h2.083z"/>
            <path stroke="#3c442b" d="M25 33.333a8.333 8.333 0 1 0 0-16.666a8.333 8.333 0 0 0 0 16.666"/>
        </g>
    </svg>
);

export const IconSelectServer = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path stroke="#4ab6ce" d="M25 6.25v4.167zM43.75 25h-4.167zM25 43.75v-4.167zM6.25 25h4.167zm25 0a6.25 6.25 0 1 0-12.5 0a6.25 6.25 0 0 0 12.5 0" />
      <path stroke="#3885cc" d="M25 39.583c8.054 0 14.583-6.529 14.583-14.583S33.054 10.417 25 10.417S10.417 16.946 10.417 25S16.946 39.583 25 39.583" />
    </g>
  </svg>
);

export const IconConfigureTunnel = ({ className }: { className?: string }) => (
  <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path stroke="#3885cc" d="M12.5 31.48a13.73 13.73 0 1 1 20.833-15.084a9.6 9.6 0 0 1 1.73-.167A8.73 8.73 0 0 1 37.5 33.333" />
      <path stroke="#3885cc" d="M33.056 31.611h-.558a.945.945 0 0 1-.887-.633a.94.94 0 0 1 .188-1.076l.388-.388a.945.945 0 0 0 0-1.34l-1.341-1.351a.946.946 0 0 0-1.342 0l-.387.387a.94.94 0 0 1-1.076.189a.945.945 0 0 1-.652-.897v-.558a.945.945 0 0 0-.945-.944h-1.888a.945.945 0 0 0-.945.944v.558a.945.945 0 0 1-.633.887v0a.94.94 0 0 1-1.076-.188l-.388-.388a.945.945 0 0 0-1.34 0l-1.351 1.341a.946.946 0 0 0 0 1.342l.387.387a.94.94 0 0 1 .189 1.076a.945.945 0 0 1-.888.633h-.567a.945.945 0 0 0-.944.945v1.889a.945.945 0 0 0 .944.944h.558a.94.94 0 0 1 .887.633v0a.94.94 0 0 1-.188 1.076l-.388.388a.945.945 0 0 0 0 1.34l1.332 1.332a.945.945 0 0 0 1.341 0l.387-.387a.945.945 0 0 1 1.077-.189a.945.945 0 0 1 .633.888v.605a.945.945 0 0 0 .944.944h1.89a.944.944 0 0 0 .944-.944v-.558a.94.94 0 0 1 .632-.887a.94.94 0 0 1 1.077.188l.387.388a.946.946 0 0 0 1.341 0l1.332-1.332a.945.945 0 0 0 0-1.341l-.387-.387a.95.95 0 0 1-.19-1.077v0a.94.94 0 0 1 .889-.633h.614a.945.945 0 0 0 .944-.944v-1.917a.945.945 0 0 0-.944-.945" />
      <path stroke="#4ab6ce" d="M25.5 36a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5" />
    </g>
  </svg>
);

export const IconDone = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#2dd213" d="m14.583 20.063l4.688 4.687l7.812-7.812"/>
            <path stroke="#0de8e5" d="M33.333 6.25h-25c-1.15 0-2.083.933-2.083 2.083v25c0 1.15.933 2.084 2.083 2.084h25c1.15 0 2.084-.933 2.084-2.084v-25c0-1.15-.933-2.083-2.084-2.083"/><path stroke="#0de8e5" d="M14.583 43.75h27.084a2.083 2.083 0 0 0 2.083-2.083v-31.25"/>
        </g>
    </svg>
);

export const IconTunnelConfiguration = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#4ab6ce" strokeWidth="2" d="M33.333 21.542v-4.875h-4.875L25 13.208l-3.458 3.459h-4.875v4.875L13.208 25l3.459 3.458v4.875h4.875L25 36.792l3.458-3.459h4.875v-4.875L36.792 25z"/>
            <path stroke="#4ab6ce" strokeWidth="3" d="M25.104 25h-.208"/>
            <path stroke="#3885cc" strokeWidth="2" d="M41.667 6.25H8.333c-1.15 0-2.083.933-2.083 2.083v33.334c0 1.15.933 2.083 2.083 2.083h33.334c1.15 0 2.083-.933 2.083-2.083V8.333c0-1.15-.933-2.083-2.083-2.083"/>
        </g>
    </svg>
);

export const IconWaitingForSelection = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#30e5fe" strokeWidth="2" d="M18.75 43.75h12.5M25 27.083V43.75z"/>
            <path stroke="#31d08f" strokeWidth="3" d="M24.896 25h.208"/>
            <path stroke="#31d08f" strokeWidth="2" d="M11.75 38.25a18.75 18.75 0 1 1 26.5 0"/>
            <path stroke="#31d08f" strokeWidth="2" d="M32.375 32.375a10.416 10.416 0 1 0-14.75 0"/>
        </g>
    </svg>
);

export const IconCreateButton = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#2dd213" d="M32.292 19.792H21.875m5.208-5.209V25z"/>
            <path stroke="#0de8e5" d="M43.75 8.333v30.209a5.208 5.208 0 1 1-10.417 0v-5.209H10.417v-25A2.083 2.083 0 0 1 12.5 6.25h29.167a2.083 2.083 0 0 1 2.083 2.083M33.333 38.542v-5.209H6.25v5.209a5.21 5.21 0 0 0 5.208 5.208h27.084a5.21 5.21 0 0 1-5.209-5.208"/>
        </g>
    </svg>
);

export const IconSelectNetworkServers = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#2dd213" d="M22.917 18.75L25 16.667v16.666m-2.083 0h4.166"/>
            <path stroke="#0de8e5" d="M25 43.75c10.355 0 18.75-8.395 18.75-18.75S35.355 6.25 25 6.25S6.25 14.645 6.25 25S14.645 43.75 25 43.75"/>
        </g>
    </svg>
);

export const IconNoServersSelected = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#2dd213" d="m31.25 18.75l-5.208 5.208zm0-6.25v6.25h6.25l6.25-6.25H37.5V6.25z"/>
            <path stroke="#0de8e5" d="M25.688 6.25H25A18.75 18.75 0 1 0 43.75 25v-.687"/><path stroke="#0de8e5" d="M35.208 27.083a10.417 10.417 0 1 1-12.291-12.291"/>
        </g>
    </svg>
);

export const IconSource = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#e80d83" strokeWidth="2" d="M18.75 43.75h12.5M25 27.083V43.75z"/>
            <path stroke="#13a8d2" strokeWidth="3" d="M24.896 25h.208"/>
            <path stroke="#13a8d2" strokeWidth="2" d="M11.75 38.25a18.75 18.75 0 1 1 26.5 0"/><path stroke="#13a8d2" strokeWidth="2" d="M32.375 32.375a10.416 10.416 0 1 0-14.75 0"/>
        </g>
    </svg>
);

export const IconDestination = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#0ddce8" d="M33.333 18.75h4.855a2.08 2.08 0 0 1 2.083 1.75l3.479 20.833a2.082 2.082 0 0 1-2.083 2.417H8.333a2.082 2.082 0 0 1-2.083-2.417L9.73 20.5a2.08 2.08 0 0 1 2.082-1.75h4.855"/>
            <path stroke="#9f13d2" d="M33.333 14.583a8.333 8.333 0 0 0-16.666 0C16.667 22.917 25 31.25 25 31.25s8.333-8.333 8.333-16.667"/>
        </g>
    </svg>
);

export const IconInProgress = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#fff" d="M25 33.333V16.667m-5.208 5.208L25 16.667l5.208 5.208"/>
            <path stroke="#4ed5d3" d="M43.75 17.23v15.54L32.77 43.75H17.23L6.25 32.77V17.23L17.23 6.25h15.54z"/>
        </g>
    </svg>
);

export const IconWarning = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#fff" strokeWidth="2" d="M25 18.75v8.333"/>
            <path stroke="#fff" strokeWidth="3" d="M25.104 35.417h-.208"/>
            <path stroke="#dcee03" strokeWidth="2" d="M21.354 8.73L5.48 37.5a4.166 4.166 0 0 0 3.646 6.25h31.75a4.167 4.167 0 0 0 3.646-6.25L28.646 8.73a4.166 4.166 0 0 0-7.292 0"/>
        </g>
    </svg>
);

export const IconError = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#fff" strokeWidth="2" d="M25 14.583v12.5"/>
            <path stroke="#fff" strokeWidth="3" d="M25.104 35.417h-.208"/>
            <path stroke="#ee3e03" strokeWidth="2" d="m36.417 7.292l9.625 16.666a2.08 2.08 0 0 1 0 2.084l-9.625 16.666a2.08 2.08 0 0 1-1.792 1.042h-19.25a2.08 2.08 0 0 1-1.792-1.042L3.958 26.042a2.08 2.08 0 0 1 0-2.084l9.625-16.666a2.08 2.08 0 0 1 1.792-1.042h19.25a2.08 2.08 0 0 1 1.792 1.042"/>
        </g>
    </svg>
);

export const IconContext = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#ea00fb" d="M41.667 8.333a4.354 4.354 0 0 0-6.146.25L21.188 22.917L18.75 31.25l8.333-2.437l14.334-14.23a4.356 4.356 0 0 0 .25-6.25"/>
            <path stroke="#ffc600" d="M25 6.25H8.333A2.083 2.083 0 0 0 6.25 8.333v33.334a2.083 2.083 0 0 0 2.083 2.083h33.334a2.083 2.083 0 0 0 2.083-2.083V25"/>
        </g>
    </svg>
);

export const IconRequired = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#ea00fb" strokeWidth="3" d="M24.896 34.375h.208"/>
            <path stroke="#ffc600" strokeWidth="2" d="M43.75 25c0-10.355-8.395-18.75-18.75-18.75S6.25 14.645 6.25 25S14.645 43.75 25 43.75S43.75 35.355 43.75 25"/><path stroke="#ea00fb" strokeWidth="2" d="M25 25V14.583"/>
        </g>
    </svg>
);

export const IconSuccess = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#0027fb" d="m16.667 25l6.25 6.25l10.416-10.417"/>
            <path stroke="#13b397" d="M25 43.75c10.355 0 18.75-8.395 18.75-18.75S35.355 6.25 25 6.25S6.25 14.645 6.25 25S14.645 43.75 25 43.75"/>
        </g>
    </svg>
);

export const IconDialogWarning = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#fbed00" strokeWidth="2" d="M25 18.75v8.333"/>
            <path stroke="#fbed00" strokeWidth="3" d="M25.104 35.417h-.208"/>
            <path stroke="#13b397" strokeWidth="2" d="M21.354 8.73L5.48 37.5a4.166 4.166 0 0 0 3.646 6.25h31.75a4.167 4.167 0 0 0 3.646-6.25L28.646 8.73a4.166 4.166 0 0 0-7.292 0"/>
        </g>
    </svg>
);

export const IconMongoUrl = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#31d08f" d="M30.208 19.792a7.375 7.375 0 0 1 0 10.416L19.792 40.625a7.375 7.375 0 0 1-10.417 0a7.375 7.375 0 0 1 0-10.417"/>
            <path stroke="#30e5fe" d="M40.625 19.792a7.375 7.375 0 0 0 0-10.417a7.375 7.375 0 0 0-10.417 0L19.792 19.792a7.375 7.375 0 0 0 0 10.416v0"/>
        </g>
    </svg>
);

export const IconGeminiApiKey = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="#31d08f" strokeWidth="3" d="M25.104 33.333h-.208"/>
            <path stroke="#30e5fe" strokeWidth="2" d="M25 43.75c5.753 0 10.417-4.664 10.417-10.417S30.753 22.917 25 22.917S14.583 27.58 14.583 33.333S19.247 43.75 25 43.75"/>
            <path stroke="#30e5fe" strokeWidth="2" d="M16.667 27.083v-12.5a8.333 8.333 0 1 1 16.666 0v12.5"/>
        </g>
    </svg>
);

export const IconApiSecretKey = ({ className }: { className?: string }) => (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path stroke="#31d08f" d="M25 33.333h4.167M25 18.75v25zm0 22.917h4.167z"/>
            <path stroke="#30e5fe" d="M25 6.25a4.167 4.167 0 1 1 0 8.333a4.167 4.167 0 0 1 0-8.333m-8.333 12.5a4.166 4.166 0 1 0 8.332 0a4.166 4.166 0 0 0-8.332 0m12.5-4.167a4.167 4.167 0 1 0 0 8.334a4.167 4.167 0 0 0 0-8.334"/>
        </g>
    </svg>
);

    