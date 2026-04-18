import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings, Loader2, Power } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import * as systemConfigService from '../../services/systemConfigService';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
import { formatApiError } from '../../lib/utils';

export default function QurbaniModuleSettings() {
  const refreshFlag = useQurbaniModuleStore((s) => s.refreshFlag);

  const [enabled, setEnabled] = useState(false);
  const [bankDetails, setBankDetails] = useState('');
  const [loadingFlag, setLoadingFlag] = useState(true);
  const [loadingBank, setLoadingBank] = useState(true);
  const [savingFlag, setSavingFlag] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    systemConfigService
      .getQurbaniModuleFlag()
      .then((res) => setEnabled(!!res.data?.enabled))
      .catch((err) =>
        toast.error('Failed to load module flag', { description: formatApiError(err) })
      )
      .finally(() => setLoadingFlag(false));

    systemConfigService
      .getBankDetails()
      .then((res) => setBankDetails(res.data?.bankDetails || ''))
      .catch((err) =>
        toast.error('Failed to load bank details', { description: formatApiError(err) })
      )
      .finally(() => setLoadingBank(false));
  }, []);

  const handleToggle = async () => {
    const next = !enabled;
    setSavingFlag(true);
    try {
      await systemConfigService.updateQurbaniModuleFlag(next);
      setEnabled(next);
      toast.success(`Module ${next ? 'activated' : 'deactivated'}`);
      // Refresh store so sidebar reacts
      await refreshFlag();
    } catch (error) {
      toast.error('Update failed', { description: formatApiError(error) });
    } finally {
      setSavingFlag(false);
    }
  };

  const handleSaveBank = async () => {
    setSavingBank(true);
    try {
      await systemConfigService.updateBankDetails(bankDetails);
      toast.success('Bank details saved');
    } catch (error) {
      toast.error('Save failed', { description: formatApiError(error) });
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Qurbani Module Settings</h1>
              <p className="text-sm text-gray-600">
                Control module visibility and payment instructions
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Module Toggle */}
        <FadeIn direction="up" delay={100}>
          <Card className="shadow-soft mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Power className="w-5 h-5 text-primary-600" />
                Module Status
              </CardTitle>
              <CardDescription>
                When inactive, users will not see the Qurbani Module in their sidebar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">Module Active</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Status:{' '}
                    {loadingFlag ? (
                      <span className="text-gray-400">Loading…</span>
                    ) : enabled ? (
                      <span className="text-success-dark font-medium">Active</span>
                    ) : (
                      <span className="text-gray-600 font-medium">Inactive</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={loadingFlag || savingFlag}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
                    enabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle module"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Bank Details */}
        <FadeIn direction="up" delay={150}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Bank Details</CardTitle>
              <CardDescription>
                Shown to users on the payment screen after they create a booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBank ? (
                <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank account instructions
                  </label>
                  <textarea
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    rows={8}
                    placeholder={`Bank: Meezan Bank\nAccount Title: Alkhidmat Foundation\nAccount #: 01234567890\nIBAN: PK00MEZN0001234567890`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      onClick={handleSaveBank}
                      disabled={savingBank}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      {savingBank ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Save Bank Details'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
