import React, { useState, useEffect } from 'react';
import { Select, SelectItem, Button, Tooltip } from '@heroui/react';
import { useTheme } from 'next-themes';
import PropTypes from 'prop-types';
import { trackCambioTema } from '../../services/analyticsService';

const ThemeSwitcher = ({ isCollapsed }) => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const themes = [
        { key: 'light', label: 'Claro', icon: 'fa-sun' },
        { key: 'dark', label: 'Oscuro', icon: 'fa-moon' },
        { key: 'girlie', label: 'Girlie', icon: 'fa-wand-magic-sparkles' },
        { key: 'boyie', label: 'Boyie', icon: 'fa-snowflake' },
    ];

    if (isCollapsed) {
        const currentTheme = themes.find(t => t.key === theme) || themes[0];
        return (
            <div className="flex justify-center w-full">
                <Tooltip content={`Tema: ${currentTheme.label}`} placement="right">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => {
                            const nextIndex = (themes.findIndex(t => t.key === theme) + 1) % themes.length;
                            setTheme(themes[nextIndex].key);
                            trackCambioTema({ tema: themes[nextIndex].key });
                        }}
                    >
                        <i className={`fa-solid ${currentTheme.icon}`} />
                    </Button>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className="pb-3 px-1 transition-opacity duration-300">
            <Select
                label="Tema Visual"
                size="sm"
                variant="flat"
                selectedKeys={[theme]}
                disallowEmptySelection={true}
                onSelectionChange={(keys) => {
                    const selected = [...keys][0];
                    if (selected) {
                        setTheme(selected);
                        trackCambioTema({ tema: selected });
                    }
                }}
                className="w-full"
                classNames={{ trigger: 'bg-default-100 hover:bg-default-200' }}
            >
                {themes.map((t) => (
                    <SelectItem key={t.key} value={t.key} startContent={<i className={`fa-solid ${t.icon} w-4`} />}>
                        {t.label}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
};

ThemeSwitcher.propTypes = {
    isCollapsed: PropTypes.bool,
};

export default ThemeSwitcher;