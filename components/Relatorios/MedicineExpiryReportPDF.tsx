
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Medicine } from '../../types';
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
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F8FAFC',
    padding: 5,
  },
  tableCol: {
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

interface MedicineExpiryReportPDFProps {
  medicines: Medicine[];
}

const MedicineExpiryReportPDF: React.FC<MedicineExpiryReportPDFProps> = ({ medicines }) => {
  const now = new Date().toLocaleString('pt-BR');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Relatório de Vencimento (60 Dias)</Text>
            <Text style={{ fontSize: 9, color: '#0A5483', marginTop: 2 }}>ProtoCaderno Digital - Gestão de Medicamentos</Text>
          </View>
          <Text style={styles.date}>Gerado em: {now}</Text>
        </View>

        {medicines.length > 0 ? (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '15%' }]}>
                <Text style={styles.tableCellHeader}>Código</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '40%' }]}>
                <Text style={styles.tableCellHeader}>Medicamento</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '15%' }]}>
                <Text style={styles.tableCellHeader}>Lote</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '15%' }]}>
                <Text style={styles.tableCellHeader}>Validade</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '15%' }]}>
                <Text style={styles.tableCellHeader}>Dias</Text>
              </View>
            </View>

            {/* Rows */}
            {medicines.map((medicine) => (
              <View style={styles.tableRow} key={medicine.id}>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={styles.tableCell}>{medicine.codigo_medicamento}</Text>
                </View>
                <View style={[styles.tableCol, { width: '40%' }]}>
                  <Text style={styles.tableCell}>{medicine.nome_medicamento}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={styles.tableCell}>{medicine.lote}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={styles.tableCell}>{formatDate(medicine.data_validade)}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={[styles.tableCell, { 
                    color: (medicine.dias_para_vencer || 0) < 0 ? '#EF4444' : 
                           (medicine.dias_para_vencer || 0) < 30 ? '#F59E0B' : '#1E293B',
                    fontWeight: (medicine.dias_para_vencer || 0) < 30 ? 'bold' : 'normal'
                  }]}>
                    {medicine.dias_para_vencer}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyMessage}>Nenhum medicamento com vencimento nos próximos 60 dias.</Text>
        )}

        <Text style={styles.footer}>
          Este documento é um relatório oficial gerado pelo sistema ProtoCaderno Digital.
        </Text>
      </Page>
    </Document>
  );
};

export default MedicineExpiryReportPDF;
