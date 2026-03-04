
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { NAF } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#0A5483',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#02416D',
  },
  date: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'right',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F8FAFC',
    padding: 5,
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 8,
    color: '#1E293B',
  },
  emptyMessage: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#94A3B8',
    borderTop: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});

interface NafsInFolderReportPDFProps {
  nafs: NAF[];
}

const NafsInFolderReportPDF: React.FC<NafsInFolderReportPDFProps> = ({ nafs }) => {
  const now = new Date().toLocaleString('pt-BR');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatório de NAFs na Pasta</Text>
            <Text style={{ fontSize: 9, color: '#0A5483', marginTop: 2 }}>ProtoCaderno Digital - Sistema de Gestão</Text>
          </View>
          <Text style={styles.date}>Gerado em: {now}</Text>
        </View>

        {nafs.length > 0 ? (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '12%' }]}>
                <Text style={styles.tableCellHeader}>Data Entrada</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '15%' }]}>
                <Text style={styles.tableCellHeader}>Número NAF</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '13%' }]}>
                <Text style={styles.tableCellHeader}>SubNAF</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '45%' }]}>
                <Text style={styles.tableCellHeader}>Fornecedor</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '15%' }]}>
                <Text style={styles.tableCellHeader}>Valor</Text>
              </View>
            </View>

            {/* Rows */}
            {nafs.map((naf, index) => (
              <View style={styles.tableRow} key={naf.id}>
                <View style={[styles.tableCol, { width: '12%' }]}>
                  <Text style={styles.tableCell}>{formatDate(naf.entry_date)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={styles.tableCell}>{naf.naf_number}</Text>
                </View>
                <View style={[styles.tableCol, { width: '13%' }]}>
                  <Text style={styles.tableCell}>{naf.subnaf_number}</Text>
                </View>
                <View style={[styles.tableCol, { width: '45%' }]}>
                  <Text style={styles.tableCell}>{naf.suppliers?.name || '---'}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={styles.tableCell}>{formatCurrency(naf.value)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyMessage}>Nenhuma NAF encontrada com a situação NA PASTA</Text>
        )}

        <Text style={styles.footer}>
          Este documento é um relatório oficial gerado pelo sistema ProtoCaderno Digital.
        </Text>
      </Page>
    </Document>
  );
};

export default NafsInFolderReportPDF;
