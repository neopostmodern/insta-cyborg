/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import React from 'react'

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.substring(1)

const ObjectAutoTable = ({
  object,
  blacklist = [],
  className = undefined,
}: {
  object: { [key: string]: Array<string> | string | number }
  blacklist?: Array<string>
  className?: string
}) => (
  <Table className={className}>
    <TableBody>
      {Object.entries(object)
        .filter(([key]: [string, any]) => !blacklist.includes(key))
        .map(([key, value]) => (
          <TableRow key={key}>
            <TableCell>
              {capitalize(
                key
                  .split(/(?=[A-Z])/)
                  .map((word) => word.toLowerCase())
                  .join(' '),
              )}
            </TableCell>
            <TableCell
              css={css`
                word-break: break-word;
              `}
            >
              {Array.isArray(value)
                ? value.map((valueItem, index) => (
                    <div
                      key={index}
                      css={css`
                        &:not(:last-child) {
                          margin-bottom: 0.5em;
                        }
                      `}
                    >
                      {valueItem}
                    </div>
                  ))
                : value}
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
)

export default ObjectAutoTable
