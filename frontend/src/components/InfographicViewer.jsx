import React from 'react';
import HTMLInfographicViewer from './HTMLInfographicViewer';

export default function InfographicViewer({ code, onRegenerate, onClose }) {
    return (
        <HTMLInfographicViewer
            data={code}
            onRegenerate={onRegenerate}
            onClose={onClose}
        />
    );
}
